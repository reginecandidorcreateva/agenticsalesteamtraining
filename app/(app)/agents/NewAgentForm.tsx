"use client";
import { useState } from "react";
import type { Agent } from "./types";
import { fieldStyle, primaryBtnSmall, secondaryBtnSmall } from "./buttonStyles";

export default function NewAgentForm({
  onCreated,
  onCancel,
}: {
  onCreated: (a: Agent) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !instructions.trim()) return;
    setSaving(true);
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, instructions, kind: "custom" }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onCreated(data);
  }

  return (
    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Name
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Negotiator"
          style={fieldStyle}
        />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        What should this helper do? (its instructions)
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. You are a Negotiator agent. When a brand counters an offer, respond with a firm but friendly counter that protects the creator's rate floor."
          style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
        />
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button type="submit" disabled={saving || !name.trim() || !instructions.trim()} style={primaryBtnSmall}>
          {saving ? "Creating…" : "Create helper"}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtnSmall}>
          Cancel
        </button>
      </div>
    </form>
  );
}
