"use client";
import type { CSSProperties } from "react";
import type { PlatformEntry } from "@/lib/mediaKit";

const inputStyle: CSSProperties = {
  padding: "9px 11px",
  borderRadius: 9,
  border: "1px solid #ebe6ee",
  fontSize: 14,
  color: "#250835",
  fontFamily: "inherit",
};

export default function PlatformsInput({
  value,
  onChange,
}: {
  value: PlatformEntry[];
  onChange: (next: PlatformEntry[]) => void;
}) {
  function update(i: number, field: keyof PlatformEntry, val: string) {
    onChange(value.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  }

  return (
    <div>
      {value.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            style={{ ...inputStyle, flex: 2 }}
            placeholder="Platform (e.g. Instagram)"
            value={p.platform}
            onChange={(e) => update(i, "platform", e.target.value)}
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Followers (e.g. 220K)"
            value={p.followers}
            onChange={(e) => update(i, "followers", e.target.value)}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            aria-label="Remove platform"
            style={{
              flex: "none",
              width: 36,
              border: "1px solid #ebe6ee",
              borderRadius: 9,
              background: "#fff",
              color: "#a79bb0",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { platform: "", followers: "" }])}
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "#ab2fed",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        + Add another platform
      </button>
    </div>
  );
}
