"use client";
import { useState } from "react";
import type { Brand } from "./types";
import { primaryBtnSmall } from "./styles";

export default function ArtifactPanel({
  title,
  value,
  updatedAt,
  buttonLabel,
  refreshLabel,
  endpoint,
  disabledReason,
  onResult,
}: {
  title: string;
  value: string;
  updatedAt: string | null;
  buttonLabel: string;
  refreshLabel: string;
  endpoint: string;
  disabledReason?: string;
  onResult: (data: Brand) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      onResult(data);
    } else {
      setError(data.error || "Something went wrong.");
    }
  }

  const blocked = Boolean(disabledReason) && !value;

  return (
    <div style={{ borderTop: "1px solid #f5f4f5", paddingTop: 18, marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#250835" }}>{title}</div>
        <button
          onClick={run}
          disabled={loading || blocked}
          style={{ ...primaryBtnSmall, opacity: loading || blocked ? 0.45 : 1, cursor: loading || blocked ? "default" : "pointer" }}
        >
          {loading ? "Working…" : value ? refreshLabel : buttonLabel}
        </button>
      </div>

      {blocked && <p style={{ fontSize: 12.5, color: "#a79bb0", margin: 0 }}>{disabledReason}</p>}
      {error && <p style={{ fontSize: 12.5, color: "#B91C1C", margin: "4px 0 0" }}>{error}</p>}

      {value ? (
        <>
          <p
            style={{
              fontSize: 13.5,
              color: "#250835",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              background: "#f5f4f5",
              border: "1px solid #ebe6ee",
              borderRadius: 10,
              padding: 14,
              margin: "8px 0 0",
            }}
          >
            {value}
          </p>
          {updatedAt && <p style={{ fontSize: 11, color: "#a79bb0", marginTop: 6 }}>Updated {new Date(updatedAt).toLocaleString()}</p>}
        </>
      ) : (
        !blocked && <p style={{ fontSize: 12.5, color: "#a79bb0", margin: 0 }}>Nothing generated yet.</p>
      )}
    </div>
  );
}
