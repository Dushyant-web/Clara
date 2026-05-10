import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, Database, ChevronDown, ChevronRight, AlertTriangle, Check, X } from 'lucide-react';
import api from '../services/api';

const AdminGauravAI = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Bata. Kya karna hai?",
            tool_calls: [],
            pending: [],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedTool, setExpandedTool] = useState(null);
    // Track confirmed SQL strings — included in next chat request so AI can re-run.
    const [confirmedSql, setConfirmedSql] = useState([]);
    const [confirming, setConfirming] = useState(null); // sql being executed
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const buildPayload = (allMessages) => {
        return allMessages
            .filter((m, i) => !(i === 0 && m.role === 'assistant'))
            .map((m) => ({
                role: m.role,
                content: m.content || '',
            }));
    };

    const send = async (overrideText = null, extraConfirmed = []) => {
        const text = overrideText !== null ? overrideText : input.trim();
        if (!text || loading) return;

        const newUser = { role: 'user', content: text };
        const updated = [...messages, newUser];
        setMessages(updated);
        if (overrideText === null) setInput('');
        setLoading(true);

        try {
            const res = await api.post('/admin/owner-ai/chat', {
                messages: buildPayload(updated),
                confirmed_sql: [...confirmedSql, ...extraConfirmed],
            });
            const reply = res.data.reply || '(no reply)';
            const tool_calls = res.data.tool_calls || [];
            const pending = res.data.pending_confirmations || [];
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: reply, tool_calls, pending },
            ]);
        } catch (err) {
            const detail = err?.response?.data?.detail || err.message || 'Request failed';
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Error: ${detail}`, tool_calls: [], pending: [] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (sql) => {
        setConfirming(sql);
        try {
            const res = await api.post('/admin/owner-ai/execute-confirmed', { query: sql });
            const result = res.data?.result || {};
            const summary = result.ok
                ? (result.row_count !== undefined
                    ? `✅ Executed. ${result.row_count} row${result.row_count === 1 ? '' : 's'} affected.`
                    : '✅ Executed successfully.')
                : `❌ Failed: ${result.error || 'unknown error'}`;

            // Insert a system message showing the result + remove pending from last message
            setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last) {
                    copy[copy.length - 1] = {
                        ...last,
                        pending: (last.pending || []).filter((p) => p.sql !== sql),
                    };
                }
                copy.push({
                    role: 'assistant',
                    content: summary,
                    tool_calls: [
                        {
                            tool: 'execute_sql',
                            arguments: { query: sql },
                            result,
                        },
                    ],
                    pending: [],
                });
                return copy;
            });
            setConfirmedSql((prev) => [...prev, sql]);
        } catch (err) {
            const detail = err?.response?.data?.detail || err.message || 'Request failed';
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Error: ${detail}`, tool_calls: [], pending: [] },
            ]);
        } finally {
            setConfirming(null);
        }
    };

    const handleCancel = (sql) => {
        setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last) {
                copy[copy.length - 1] = {
                    ...last,
                    pending: (last.pending || []).filter((p) => p.sql !== sql),
                };
            }
            copy.push({
                role: 'assistant',
                content: 'Cancelled.',
                tool_calls: [],
                pending: [],
            });
            return copy;
        });
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif tracking-tighter mb-2 flex items-center gap-3">
                        <Sparkles size={28} className="text-yellow-400" />
                        Gaurav ka AI
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                        Personal AI · Full DB access · Confirms destructive actions
                    </p>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar bg-black/30 border border-white/5 p-4 md:p-6 space-y-4"
            >
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] ${
                                m.role === 'user'
                                    ? 'bg-white text-black px-4 py-3'
                                    : 'bg-white/[0.04] border border-white/5 text-white px-4 py-3'
                            }`}
                        >
                            {m.content && (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            )}

                            {/* Pending confirmations — destructive SQL waiting for owner approval */}
                            {m.pending && m.pending.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {m.pending.map((p, pi) => (
                                        <div
                                            key={pi}
                                            className="border border-yellow-400/40 bg-yellow-400/5 p-3"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle size={14} className="text-yellow-400" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-yellow-400">
                                                    Confirmation Required
                                                </span>
                                            </div>
                                            <pre className="text-[11px] text-white/80 font-mono whitespace-pre-wrap break-all bg-black/40 p-2 mb-3">
                                                {p.sql}
                                            </pre>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConfirm(p.sql)}
                                                    disabled={confirming === p.sql}
                                                    className="flex items-center gap-1 px-3 py-2 bg-yellow-400 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-yellow-300 transition-colors disabled:opacity-50"
                                                >
                                                    {confirming === p.sql ? (
                                                        <Loader2 size={11} className="animate-spin" />
                                                    ) : (
                                                        <Check size={11} />
                                                    )}
                                                    Confirm Action
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(p.sql)}
                                                    disabled={confirming === p.sql}
                                                    className="flex items-center gap-1 px-3 py-2 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-colors"
                                                >
                                                    <X size={11} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Executed tool calls — collapsible details */}
                            {m.tool_calls && m.tool_calls.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                    {m.tool_calls.map((t, ti) => {
                                        const key = `${i}-${ti}`;
                                        const expanded = expandedTool === key;
                                        const isPending = t.result?.pending_confirmation;
                                        const failed = t.result?.ok === false && !isPending;
                                        return (
                                            <div key={ti} className="bg-black/40 border border-white/5 text-[10px]">
                                                <button
                                                    onClick={() => setExpandedTool(expanded ? null : key)}
                                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 uppercase tracking-widest font-bold">
                                                        <Database size={10} />
                                                        {t.tool}
                                                        <span
                                                            className={`ml-2 ${
                                                                isPending
                                                                    ? 'text-yellow-400'
                                                                    : failed
                                                                    ? 'text-red-400'
                                                                    : 'text-green-400'
                                                            }`}
                                                        >
                                                            {isPending ? 'PENDING' : failed ? 'FAILED' : 'OK'}
                                                        </span>
                                                        {t.result?.row_count !== undefined && (
                                                            <span className="text-white/40">· {t.result.row_count} rows</span>
                                                        )}
                                                    </div>
                                                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                </button>
                                                <AnimatePresence>
                                                    {expanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-3 py-2 border-t border-white/5">
                                                                <p className="text-white/40 mb-1 uppercase tracking-widest">Args</p>
                                                                <pre className="text-white/70 whitespace-pre-wrap break-all mb-2 font-mono">
                                                                    {JSON.stringify(t.arguments, null, 2)}
                                                                </pre>
                                                                <p className="text-white/40 mb-1 uppercase tracking-widest">Result</p>
                                                                <pre className="text-white/70 whitespace-pre-wrap break-all max-h-64 overflow-y-auto font-mono">
                                                                    {JSON.stringify(t.result, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/[0.04] border border-white/5 px-4 py-3 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-white/60" />
                            <span className="text-xs uppercase tracking-widest text-white/40">Thinking…</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="Pucho kuch bhi… revenue, top customer, delete user X, create promo SAVE10 30% off…"
                    className="flex-1 bg-black/40 border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/20 text-white"
                />
                <button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="px-6 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send
                </button>
            </div>

            <p className="text-[9px] text-white/30 mt-2 uppercase tracking-widest">
                ⚠ DELETE / DROP / TRUNCATE / mass-UPDATE require explicit confirmation. Other queries auto-execute.
            </p>
        </div>
    );
};

export default AdminGauravAI;
