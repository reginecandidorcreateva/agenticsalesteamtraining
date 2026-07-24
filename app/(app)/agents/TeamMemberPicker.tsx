"use client";
import type { Agent } from "./types";

export default function TeamMemberPicker({
  agents,
  selectedIds,
  onChange,
}: {
  agents: Agent[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  function toggle(id: number) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  if (agents.length === 0) {
    return <p style={{ fontSize: 13, color: "#a79bb0" }}>Create a helper first, then add it to a team.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {agents.map((a) => (
        <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#250835" }}>
          <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggle(a.id)} />
          {a.name}
        </label>
      ))}
    </div>
  );
}
