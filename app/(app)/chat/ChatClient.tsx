"use client";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatAgent } from "./types";

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/chat/messages").then((r) => r.json()),
      fetch("/api/agents").then((r) => r.json()),
    ]).then(([msgs, ags]) => {
      setMessages(msgs);
      setAgents(ags);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function insertMention(name: string) {
    setInput((prev) => (prev.trim() ? prev.trim() + " " : "") + "@" + name + " ");
    inputRef.current?.focus();
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setError("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", agentId: null, agentName: null, content, isError: false, createdAt: new Date().toISOString() },
    ]);

    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setMessages((prev) => [...prev.filter((m) => m.id !== tempId), data.userMessage, data.agentMessage]);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(data.error || "Something went wrong.");
    }
  }

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your chat…</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 4px" }}>
        Chat
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 16 }}>
        Mention a helper with @Name and they&apos;ll actually go do it.
      </p>

      {agents.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => insertMention(a.name)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#ab2fed",
                background: "#faf6ff",
                border: "1px solid #decaff",
                borderRadius: 999,
                padding: "5px 12px",
                cursor: "pointer",
              }}
            >
              @{a.name}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f5f4f5",
          border: "1px solid #ebe6ee",
          borderRadius: 16,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {messages.length === 0 && (
          <p style={{ fontSize: 13.5, color: "#a79bb0", textAlign: "center", margin: "auto" }}>
            Try typing &quot;@Research find me some fitness brands&quot;
          </p>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {sending && (
          <div style={{ alignSelf: "flex-start", fontSize: 13, color: "#a79bb0", fontStyle: "italic" }}>Working…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 8 }}>{error}</p>}

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "@Research find me some fitness brands"'
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ebe6ee",
            fontSize: 14,
            color: "#250835",
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            background: "#250835",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 12,
            padding: "12px 24px",
            border: "none",
            cursor: sending ? "default" : "pointer",
            opacity: sending ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && message.agentName && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ab2fed", marginBottom: 3, marginLeft: 4 }}>{message.agentName}</div>
      )}
      <div
        style={{
          maxWidth: "75%",
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          padding: "10px 14px",
          borderRadius: 14,
          color: isUser ? "#fff" : message.isError ? "#B91C1C" : "#250835",
          background: isUser ? "#250835" : message.isError ? "#FEECEC" : "#fff",
          border: isUser ? "none" : `1px solid ${message.isError ? "#f3c9c9" : "#ebe6ee"}`,
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
