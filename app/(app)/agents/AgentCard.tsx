"use client";
import { useState } from "react";
import type { Agent, LastRun } from "./types";
import { primaryBtnSmall, secondaryBtnSmall } from "./buttonStyles";

const KIND_TINT: Record<string, string> = {
  research: "#decaff",
  outreach: "#e9bded",
  proposal: "#bbcfe4",
  followup: "#decaff",
  scheduler: "#e9bded",
  custom: "#bbcfe4",
};

export default function AgentCard({
  agent,
  onUpdate,
  onDelete,
}: {
  agent: Agent;
  onUpdate: (a: Agent) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(agent.name);
  const [instructions, setInstructions] = useState(agent.instructions);
  const [saving, setSaving] = useState(false);

  const [tryOpen, setTryOpen] = useState(false);
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LastRun | null>(agent.lastRun);

  async function saveEdit() {
    if (!name.trim() || !instructions.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, instructions }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onUpdate({ ...agent, ...data });
      setEditing(false);
    }
  }

  async function runAgent() {
    if (!task.trim()) return;
    setRunning(true);
    const res = await fetch(`/api/agents/${agent.id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    const data = await res.json();
    setResult(data);
    setRunning(false);
  }

  async function remove() {
    if (!confirm(`Remove ${agent.name}?`)) return;
    await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
    onDelete(agent.id);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#250835",
                border: "1px solid #ebe6ee",
                borderRadius: 8,
                padding: "4px 8px",
                fontFamily: "inherit",
              }}
            />
          ) : (
            <div style={{ fontSize: 17, fontWeight: 700, color: "#250835" }}>{agent.name}</div>
          )}
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: "#473054",
              background: KIND_TINT[agent.kind] ?? "#f5f4f5",
              borderRadius: 999,
              padding: "3px 10px",
              textTransform: "uppercase",
            }}
          >
            {agent.kind}
          </span>
        </div>
        <button onClick={remove} style={{ fontSize: 12, color: "#a79bb0", background: "none", border: "none", cursor: "pointer" }}>
          Remove
        </button>
      </div>

      {editing ? (
        <>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{
              width: "100%",
              minHeight: 90,
              fontSize: 13.5,
              color: "#250835",
              border: "1px solid #ebe6ee",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} disabled={saving} style={primaryBtnSmall}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(agent.name);
                setInstructions(agent.instructions);
              }}
              style={secondaryBtnSmall}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            style={{
              fontSize: 13.5,
              color: "#6a5b72",
              lineHeight: 1.5,
              margin: "0 0 12px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {agent.instructions}
          </p>
          <button
            onClick={() => setEditing(true)}
            style={{ fontSize: 12.5, fontWeight: 600, color: "#ab2fed", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 14 }}
          >
            Edit instructions
          </button>
        </>
      )}

      <div style={{ borderTop: "1px solid #f5f4f5", marginTop: 6, paddingTop: 14 }}>
        <button
          onClick={() => setTryOpen((v) => !v)}
          style={{ fontSize: 13.5, fontWeight: 600, color: "#250835", background: "#f5f4f5", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}
        >
          {tryOpen ? "Hide" : "Try it"}
        </button>

        {tryOpen && (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Write a pitch to Glossier"
              style={{
                width: "100%",
                minHeight: 60,
                fontSize: 13.5,
                color: "#250835",
                border: "1px solid #ebe6ee",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                fontFamily: "inherit",
              }}
            />
            <button onClick={runAgent} disabled={running || !task.trim()} style={{ ...primaryBtnSmall, opacity: running ? 0.6 : 1 }}>
              {running ? "Working…" : "Generate"}
            </button>

            {result && (
              <div
                style={{
                  marginTop: 12,
                  background: result.error ? "#FEECEC" : "#f5f4f5",
                  border: `1px solid ${result.error ? "#f3c9c9" : "#ebe6ee"}`,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                {result.error ? (
                  <p style={{ fontSize: 13, color: "#B91C1C", margin: 0 }}>{result.error}</p>
                ) : (
                  <p style={{ fontSize: 13.5, color: "#250835", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{result.output}</p>
                )}
                <p style={{ fontSize: 11, color: "#a79bb0", margin: "8px 0 0" }}>{new Date(result.createdAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
