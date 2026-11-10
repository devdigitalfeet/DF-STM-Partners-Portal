"use client";

import { useEffect, useRef, useState } from "react";

type Bubble = { role: "user" | "assistant"; text: string };

const GREETING =
  "Hi! I'm DF's partnerships assistant. I'll ask a few questions about your business so Maia, who looks after our partners, has everything needed before reaching out. To start, what's your name and which company are you with?";

export function PartnerChat() {
  // Raw API history (opaque to the UI) and the visible bubbles are kept separately.
  const [history, setHistory] = useState<unknown[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [bubbles, pending]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setError(null);
    setBubbles((b) => [...b, { role: "user", text }]);
    setPending(true);
    try {
      const res = await fetch("/api/partner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setHistory(data.history);
      if (data.reply) setBubbles((b) => [...b, { role: "assistant", text: data.reply }]);
      if (data.submitted) setSubmitted(true);
    } catch (err) {
      setBubbles((b) => b.slice(0, -1));
      setInput(text);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[70vh] min-h-120 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">DF</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Partnerships assistant</p>
          <p className="text-xs text-slate-500">{submitted ? "Application sent to Maia" : "Usually replies in a few seconds"}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
        {bubbles.map((b, i) => (
          <div key={i} className={`flex ${b.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                b.role === "user" ? "rounded-br-sm bg-indigo-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-900"
              }`}
            >
              {b.text}
            </p>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <p className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-500">Typing…</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <label htmlFor="partner-msg" className="sr-only">
          Your message
        </label>
        <input
          id="partner-msg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          maxLength={4000}
          autoComplete="off"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
