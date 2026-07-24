"use client";
import { useState } from "react";
import type { Agent, Team } from "./types";
import TeamMemberPicker from "./TeamMemberPicker";
import { primaryBtnSmall, secondaryBtnSmall } from "./buttonStyles";

export default function TeamCard({
  team,
  agents,
  onUpdate,
  onDelete,
}: {
  team: Team;
  agents: Agent[];
  onUpdate: (t: Team) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [selected, setSelected] = useState<number[]>(team.members.map((m) => m.id));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, agentIds: selected }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onUpdate(data);
      setEditing(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    await fetch(`/api/teams/${team.id}`, { method: "DELETE" });
    onDelete(team.id);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 22 }}>
      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              fontSize: 15,
              fontWeight: 700,
              color: "#250835",
              border: "1px solid #ebe6ee",
              borderRadius: 8,
              padding: "6px 10px",
              marginBottom: 12,
              fontFamily: "inherit",
            }}
          />
          <TeamMemberPicker agents={agents} selectedIds={selected} onChange={setSelected} />
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={save} disabled={saving} style={primaryBtnSmall}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)} style={secondaryBtnSmall}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#250835", marginBottom: 10 }}>{team.name}</div>
            <button onClick={remove} style={{ fontSize: 12, color: "#a79bb0", background: "none", border: "none", cursor: "pointer" }}>
              Delete
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {team.members.length === 0 && <span style={{ fontSize: 13, color: "#a79bb0" }}>No helpers yet</span>}
            {team.members.map((m) => (
              <span
                key={m.id}
                style={{ fontSize: 12.5, fontWeight: 600, color: "#473054", background: "#f5f4f5", borderRadius: 999, padding: "4px 11px" }}
              >
                {m.name}
              </span>
            ))}
          </div>
          <button
            onClick={() => setEditing(true)}
            style={{ fontSize: 12.5, fontWeight: 600, color: "#ab2fed", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Edit team
          </button>
        </>
      )}
    </div>
  );
}
