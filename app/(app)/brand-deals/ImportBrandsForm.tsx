"use client";
import { useState } from "react";
import type { Brand } from "./types";
import { fieldStyle, primaryBtnSmall, secondaryBtnSmall } from "./styles";

export default function ImportBrandsForm({
  onImported,
  onCancel,
}: {
  onImported: (brands: Brand[]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/brands/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onImported(data);
    } else {
      setError(data.error || "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Paste a list — one brand per line
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Glossier, glossier.com\nFable Skincare\nSolstice Skincare, solsticeskincare.com"}
          style={{ ...fieldStyle, minHeight: 120, resize: "vertical", fontFamily: "monospace" }}
        />
      </label>
      <p style={{ fontSize: 12.5, color: "#a79bb0", marginTop: -8, marginBottom: 14 }}>
        Optional: add a website after a comma, e.g. &quot;Glossier, glossier.com&quot;.
      </p>
      {error && <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={saving || !text.trim()} style={primaryBtnSmall}>
          {saving ? "Importing…" : "Import"}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtnSmall}>
          Cancel
        </button>
      </div>
    </form>
  );
}
