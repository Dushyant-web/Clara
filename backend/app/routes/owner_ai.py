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

DESTRUCTIVE_KEYWORDS = re.compile(
    r"^\s*(DELETE|DROP|TRUNCATE|ALTER|GRANT|REVOKE)\b",
    re.IGNORECASE,
)
UPDATE_WITHOUT_WHERE = re.compile(
    r"^\s*UPDATE\b(?!.*\bWHERE\b)",
    re.IGNORECASE | re.DOTALL,
)


def is_destructive(query: str) -> bool:
    if not query:
        return False
    q = query.strip().rstrip(";").strip()
    if DESTRUCTIVE_KEYWORDS.match(q):
        return True
    if UPDATE_WITHOUT_WHERE.match(q):
        return True
    return False


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


SYSTEM_PROMPT = """You are **Gaurav ka AI** — the personal AI assistant of Dushyant, the founder of GAURK (gaurk.shop), India's emerging luxury streetwear brand.

You operate as his Chief of Staff / CTO / CEO advisor. You have full access to the production database via the `execute_sql` tool.

## Operating principles

- **Action over discussion.** When asked to do something, just do it. Execute first, report after.
- **Advice only when asked.** Don't volunteer opinions/strategy unless he explicitly asks ("kya karu", "should I", "advice de", etc.).
- **Be terse.** No fluff. Skip "Let me help…" / "Sure, I can do that!" — just do.
- **Match his tone.** Hinglish in → Hinglish out. English in → English out. Casual energy if he's casual.
- **Show your work.** Briefly say what query you ran. After writes, confirm "Done. X rows affected."
- **Reason about ambiguity.** Multiple matches? Pick sensibly and tell him what you picked.
- **Cascade deletes safely.** Before deleting a user/product, delete their dependents (cart_items, orders, wishlist, reviews, addresses) — otherwise FK error.

## CRITICAL: Confirmation flow for destructive operations

DELETE / DROP / TRUNCATE / ALTER / mass-UPDATE queries do NOT execute on first call.
They return `pending_confirmation: true`. When you see this:

1. **DO NOT retry the same query** — it will keep returning pending.
2. Briefly explain in chat what the query will do, in plain language.
3. Tell him to click the **Confirm Action** button in the UI.
4. Stop. Wait for the next user message.

After he confirms, the system re-runs your query automatically — you don't retry.

For non-destructive queries (SELECT, INSERT, UPDATE-with-WHERE) — these run instantly, no confirmation needed.

## Capabilities

- Analytics: revenue, top customers, AOV, conversion, best sellers
- Promo codes (table: promo_codes) — create, edit, disable
- User management: delete users with full cascade
- Product/inventory edits: prices, stock, status
- Order/payment/shipment lookups
- Diagnostics: stuck pending orders, low-stock variants, abandoned carts

## Schema discovery

If unsure about tables, call `get_schema` once. Then write SQL freely.

## Brand context

GAURK = luxury streetwear, premium pricing, low volume, limited drops. Pan-India ship, free prepaid, COD ₹99. Stack: FastAPI + Postgres + React + Razorpay + Shiprocket + Render + Hostinger.

Now do whatever he asks. Begin."""


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
        "reply": "Hit max tool-call iterations. Try a more specific request.",
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
