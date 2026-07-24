"use client";
import { useState } from "react";
import type { Brand } from "./types";
import { fieldStyle, primaryBtnSmall, secondaryBtnSmall } from "./styles";

export default function AddBrandForm({
  onCreated,
  onCancel,
}: {
  onCreated: (b: Brand) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, website, contactEmail, notes }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onCreated(data);
  }

  return (
    <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Brand name
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Glossier" style={fieldStyle} />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Website (optional)
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. glossier.com" style={fieldStyle} />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Contact email (optional)
        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="e.g. partnerships@glossier.com" style={fieldStyle} />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
        Notes (optional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth remembering about this brand"
          style={{ ...fieldStyle, minHeight: 70, resize: "vertical" }}
        />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={saving || !name.trim()} style={primaryBtnSmall}>
          {saving ? "Adding…" : "Add brand"}
        </button>
        <button type="button" onClick={onCancel} style={secondaryBtnSmall}>
          Cancel
        </button>
      </div>
    </form>
  );
}
