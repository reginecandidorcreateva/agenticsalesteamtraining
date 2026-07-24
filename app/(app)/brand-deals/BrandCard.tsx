"use client";
import { STAGES } from "@/lib/brands";
import type { Brand } from "./types";

export default function BrandCard({
  brand,
  onMove,
  onRemove,
  onOpen,
}: {
  brand: Brand;
  onMove: (id: number, status: string) => void;
  onRemove: (id: number) => void;
  onOpen: (brand: Brand) => void;
}) {
  const badges = [
    brand.brief && "Brief",
    brand.pitch && "Pitch",
    brand.proposal && "Proposal",
    brand.followup && "Follow-up",
  ].filter(Boolean) as string[];

  return (
    <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <button
          onClick={() => onOpen(brand)}
          style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
        >
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "#250835" }}>{brand.name}</span>
        </button>
        <button
          onClick={() => onRemove(brand.id)}
          aria-label="Remove brand"
          style={{ fontSize: 16, lineHeight: 1, color: "#a79bb0", background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
      </div>
      {brand.website && <div style={{ fontSize: 12, color: "#6a5b72", marginTop: 4 }}>{brand.website}</div>}

      {badges.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
          {badges.map((b) => (
            <span
              key={b}
              style={{ fontSize: 10.5, fontWeight: 700, color: "#473054", background: "#f5f4f5", borderRadius: 999, padding: "2px 8px" }}
            >
              {b}
            </span>
          ))}
        </div>
      )}

      <select
        value={brand.status}
        onChange={(e) => onMove(brand.id, e.target.value)}
        style={{
          marginTop: 10,
          width: "100%",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#473054",
          background: "#f5f4f5",
          border: "1px solid #ebe6ee",
          borderRadius: 8,
          padding: "6px 8px",
        }}
      >
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => onOpen(brand)}
        style={{
          marginTop: 8,
          width: "100%",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#ab2fed",
          background: "#faf6ff",
          border: "1px solid #decaff",
          borderRadius: 8,
          padding: "7px 8px",
          cursor: "pointer",
        }}
      >
        Open — research, pitch, proposal, follow-up
      </button>
    </div>
  );
}
