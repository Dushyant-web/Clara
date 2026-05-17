"""
Gaurav ka AI — owner-only personal AI assistant for GAURK admin.

Has full DB access via SQL tool calls. Uses NVIDIA's OpenAI-compatible API.
Acts as CTO/CEO advisor; auto-executes safe ops, asks confirmation for destructive ones.
"""
import os
import re
import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from openai import OpenAI

from app.database.db import get_db
from app.utils.admin_auth import admin_required


router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str | None = None
    tool_call_id: str | None = None
    tool_calls: list[dict] | None = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    # SQL strings the user has explicitly approved via the Confirm button.
    # Any destructive query in this list will execute; otherwise it's queued.
    confirmed_sql: list[str] = []


class ConfirmExecuteRequest(BaseModel):
    query: str


# ============================================================================
# Destructive-operation detection
# ============================================================================

# Any write operation requires explicit owner confirmation.
# SELECT/SHOW/EXPLAIN/WITH (CTE wrapping a SELECT) are auto-executed.
WRITE_KEYWORDS = re.compile(
    r"^\s*(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|REPLACE|MERGE|GRANT|REVOKE|RENAME)\b",
    re.IGNORECASE,
)


def is_destructive(query: str) -> bool:
    """Returns True if the query mutates data (needs confirmation)."""
    if not query:
        return False
    q = query.strip().rstrip(";").strip()
    return bool(WRITE_KEYWORDS.match(q))


def normalize_sql(s: str) -> str:
    """For confirmation matching: collapse whitespace + trim semicolons."""
    return re.sub(r"\s+", " ", (s or "").strip().rstrip(";")).strip().lower()


# ============================================================================
# DB tool implementation
# ============================================================================

def execute_sql_raw(db: Session, query: str) -> dict:
    """Run raw SQL. Returns rows for SELECT, rowcount for write ops."""
    try:
        result = db.execute(text(query))
        if result.returns_rows:
            rows = [dict(row._mapping) for row in result.fetchall()]
            for r in rows:
                for k, v in r.items():
                    if hasattr(v, "isoformat"):
                        r[k] = v.isoformat()
                    elif not isinstance(v, (str, int, float, bool, type(None), list, dict)):
                        r[k] = str(v)
            db.commit()
            return {"ok": True, "rows": rows[:200], "row_count": len(rows)}
        else:
            db.commit()
            return {"ok": True, "row_count": result.rowcount}
    except Exception as e:
        db.rollback()
        return {"ok": False, "error": str(e)}


def execute_sql_with_confirmation(db: Session, query: str, confirmed_set: set[str]) -> dict:
    """
    Wrapper: if destructive AND not pre-confirmed, return a 'pending' marker
    instead of executing. Frontend will surface a Confirm button to the owner.
    """
    if is_destructive(query) and normalize_sql(query) not in confirmed_set:
        return {
            "ok": False,
            "pending_confirmation": True,
            "sql": query,
            "reason": "Destructive operation. Owner must click 'Confirm Action' before this runs.",
        }
    return execute_sql_raw(db, query)


def get_schema(db: Session) -> dict:
    q = text("""
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)
    result = db.execute(q).fetchall()
    schema: dict[str, list[dict]] = {}
    for table, col, dtype, nullable in result:
        schema.setdefault(table, []).append({
            "column": col,
            "type": dtype,
            "nullable": nullable == "YES"
        })
    return schema


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "execute_sql",
            "description": (
                "Execute raw SQL on the GAURK Postgres DB. Use for SELECT (analytics), "
                "INSERT (create promo codes, etc.), UPDATE (modify products, users, "
                "orders), DELETE (remove users, orders, etc.). Returns rows for SELECT, "
                "row_count for writes. NOTE: Destructive ops (DELETE/DROP/TRUNCATE/"
                "ALTER/UPDATE-without-WHERE) return pending_confirmation=true and do "
                "NOT execute until the owner clicks Confirm in the UI. When you see a "
                "pending_confirmation result, explain to the owner exactly what the "
                "query will do and tell them to click Confirm — do NOT retry the query."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Valid Postgres SQL.",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_schema",
            "description": "Get all tables and columns of the GAURK database. Call once at the start if you don't know the schema.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


SYSTEM_PROMPT = """You are **Gaurav ka AI** founder name is - Ganesh  — Dushyant's personal AI for GAURK (gaurk.shop), an Indian luxury streetwear brand. You're his Chief of Staff / CTO / CEO advisor with full DB access via the `execute_sql` tool.

## Talk like a friend, not a robot

Casual, direct, human. Short sentences. Hinglish if he's Hinglish, English if he's English. Match his energy.

❌ "I have executed the query and the results show that..."
✅ "Dev ne kuch order nahi kiya hai abhi tak."

❌ "I will now retrieve the data for the requested user."
✅ "Dekh raha hu..."

## When NOT to call any tool

For greetings, small talk, typos, vague messages — just reply in 1 short line. NO SQL.

Examples (plain text reply, no tool call):
- "hello", "hi", "hey", "yo", "kya haal", "sup", "or", "test"
- "thanks", "ok", "cool", "nice", "haan", "theek hai"
- "you there?", "kaise ho"
- typos / random words / gibberish
- Questions about you ("who are you", "kya kar sakte ho")

## When to call `execute_sql`

ONLY when he clearly wants:
- **Data**: "show orders", "revenue today", "top customers", "stock kya hai"
- **Action**: "delete user X", "create promo SAVE10", "update price of Y"
- **Analysis**: "sabse zyada kya bik raha", "AOV nikaal", "kaunsa size out of stock"

If unsure → just ASK him in plain text. Don't guess and run queries.

## Be EFFICIENT with queries — this is critical

You have a HARD LIMIT of 8 tool calls per turn. Don't waste them.

✅ ONE good JOIN query is better than 5 separate ones.
✅ Use ILIKE / LOWER for fuzzy text matching: `LOWER(name) LIKE '%dev%' OR LOWER(email) LIKE '%dev%'`
✅ If a query returns 0 rows, the data doesn't exist — don't keep trying variations. Just tell him.
✅ Call `get_schema` AT MOST ONCE per conversation. After that, you know the schema.
✅ Think first, then query. Don't fire shotgun queries hoping one hits.

❌ Don't run 6 SELECTs that all return 0 — say "Dev nahi mila DB me" after the first or second miss.
❌ Don't re-call get_schema mid-conversation.

If first query returns nothing → second query with broader match → if still nothing → tell him plainly: "X not found, did you mean Y?"

## CRITICAL: Confirmation flow for ALL DB writes

Every write op (INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE) returns `pending_confirmation: true` and does NOT execute. When you see this:
1. DO NOT retry — same result.
2. In plain language tell him what'll happen (1-2 lines).
3. Tell him to click the **Confirm Action** button.
4. Stop. Wait for next message.

After he confirms, the system auto-runs the query. You don't retry.

Reads (SELECT / SHOW / EXPLAIN) execute instantly — no confirmation.

## Operating principles

- Action over discussion. Don't ask 5 clarifying questions before doing something.
- Advice only when asked ("kya karu", "should I", "advice de").
- Show your work briefly. After confirmed writes, just: "Done. X rows."
- Cascade deletes safely. Before deleting a user/product, delete dependents (each one needs confirmation).

## Capabilities

- Analytics: revenue, top customers, AOV, conversion, best sellers
- Promo codes (table: promo_codes) — create, edit, disable
- User management: delete users with full cascade
- Product/inventory edits: prices, stock, status
- Order/payment/shipment lookups
- Diagnostics: stuck pending orders, low-stock variants, abandoned carts

## Brand context

GAURK = luxury streetwear, premium pricing, low volume, limited drops. Pan-India ship, free prepaid, COD ₹99. Stack: FastAPI + Postgres + React + Razorpay + Shiprocket + Render + Hostinger.

Now respond like a sharp, casual friend. Begin."""


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/admin/owner-ai/chat", dependencies=[Depends(admin_required)])
def owner_ai_chat(req: ChatRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY not configured")

    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
    )

    confirmed_set = {normalize_sql(s) for s in (req.confirmed_sql or [])}

    messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.messages:
        msg: dict[str, Any] = {"role": m.role}
        if m.content is not None:
            msg["content"] = m.content
        if m.tool_call_id:
            msg["tool_call_id"] = m.tool_call_id
        if m.tool_calls:
            msg["tool_calls"] = m.tool_calls
        messages.append(msg)

    executed_tools: list[dict] = []
    pending_confirmations: list[dict] = []
    max_iterations = 8

    for _ in range(max_iterations):
        try:
            response = client.chat.completions.create(
                model="meta/llama-3.3-70b-instruct",
                messages=messages,
                tools=TOOLS,
                temperature=0.4,
                max_tokens=2048,
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"NVIDIA API error: {str(e)}")

        msg = response.choices[0].message

        if not msg.tool_calls:
            return {
                "reply": msg.content or "",
                "tool_calls": executed_tools,
                "pending_confirmations": pending_confirmations,
            }

        assistant_msg: dict[str, Any] = {"role": "assistant", "content": msg.content or ""}
        assistant_msg["tool_calls"] = [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in msg.tool_calls
        ]
        messages.append(assistant_msg)

        for tc in msg.tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}

            if tc.function.name == "execute_sql":
                query = args.get("query", "")
                result = execute_sql_with_confirmation(db, query, confirmed_set)
                if result.get("pending_confirmation"):
                    pending_confirmations.append({"sql": query})
            elif tc.function.name == "get_schema":
                result = {"ok": True, "schema": get_schema(db)}
            else:
                result = {"ok": False, "error": f"Unknown tool: {tc.function.name}"}

            executed_tools.append({
                "tool": tc.function.name,
                "arguments": args,
                "result": result,
            })

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, default=str)[:8000],
            })

    return {
        "reply": "Itni queries chala li par answer nahi mila. Thoda specific bata — kaunsa user/order/product chahiye?",
        "tool_calls": executed_tools,
        "pending_confirmations": pending_confirmations,
    }


@router.post("/admin/owner-ai/execute-confirmed", dependencies=[Depends(admin_required)])
def execute_confirmed(req: ConfirmExecuteRequest, db: Session = Depends(get_db)):
    """
    Directly execute a destructive SQL that the owner explicitly approved
    via the Confirm Action button. Bypasses the AI loop.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Empty query")
    result = execute_sql_raw(db, req.query)
    return {"result": result}
