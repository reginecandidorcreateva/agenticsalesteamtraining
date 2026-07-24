"use client";
import type { Brand } from "./types";
import { primaryBtnSmall } from "./styles";

export default function ApprovalCard({
  brand,
  onApprove,
  onRemove,
}: {
  brand: Brand;
  onApprove: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ebe6ee",
        borderRadius: 14,
        padding: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#250835" }}>{brand.name}</div>
        {brand.website && <div style={{ fontSize: 12.5, color: "#6a5b72", marginTop: 2 }}>{brand.website}</div>}
        {brand.notes && <div style={{ fontSize: 12.5, color: "#a79bb0", marginTop: 4 }}>{brand.notes}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, flex: "none" }}>
        <button onClick={() => onApprove(brand.id)} style={primaryBtnSmall}>
          Approve
        </button>
        <button
          onClick={() => onRemove(brand.id)}
          style={{ fontSize: 13, color: "#a79bb0", background: "none", border: "1px solid #ebe6ee", borderRadius: 9, padding: "9px 16px", cursor: "pointer" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
