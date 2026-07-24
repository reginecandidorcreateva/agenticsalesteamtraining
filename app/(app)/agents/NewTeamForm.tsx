"use client";
import { useState } from "react";
import type { Agent, Team } from "./types";
import TeamMemberPicker from "./TeamMemberPicker";
import { fieldStyle, primaryBtnSmall, secondaryBtnSmall } from "./buttonStyles";

export default function NewTeamForm({
  agents,
  onCreated,
  onCancel,
}: {
  agents: Agent[];
  onCreated: (t: Team) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, agentIds: selected }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onCreated(data);
  }

  return (
    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Team name
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Launch Team"
          style={fieldStyle}
        />
      </label>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#250835", marginBottom: 8 }}>Helpers on this team</div>
      <TeamMemberPicker agents={agents} selectedIds={selected} onChange={setSelected} />
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button type="submit" disabled={saving || !name.trim()} style={primaryBtnSmall}>
          {saving ? "Creating…" : "Create team"}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtnSmall}>
          Cancel
        </button>
      </div>
    </form>
  );
}
