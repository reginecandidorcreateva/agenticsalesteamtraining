"use client";
import { useState } from "react";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ebe6ee",
  fontSize: 14,
  color: "#250835",
  marginTop: 6,
  marginBottom: 18,
  fontFamily: "inherit",
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div
        style={{
          background: "#E7F7EC",
          border: "1px solid #bfe8cc",
          borderRadius: 16,
          padding: 28,
          maxWidth: 480,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, color: "#1B7A3D", margin: "0 0 4px" }}>
          Message sent.
        </p>
        <p style={{ fontSize: 14, color: "#1B7A3D", margin: 0 }}>
          We&apos;ve got it and will get back to you at {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Name
        <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Email
        <input
          type="email"
          style={fieldStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Message
        <textarea
          style={{ ...fieldStyle, minHeight: 120, resize: "vertical" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      {error && (
        <p style={{ fontSize: 13.5, color: "#B91C1C", marginBottom: 14 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={sending}
        style={{
          background: "#250835",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 12,
          padding: "10px 22px",
          border: "none",
          cursor: sending ? "default" : "pointer",
          opacity: sending ? 0.6 : 1,
        }}
      >
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
