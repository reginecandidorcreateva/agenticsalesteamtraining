"use client";
import { useEffect, useState } from "react";

export default function SettingsForm() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setNotificationsEnabled(Boolean(data?.notificationsEnabled ?? true)))
      .finally(() => setLoading(false));
  }, []);

  async function toggle() {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationsEnabled: next }),
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your settings…</p>;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ebe6ee",
        borderRadius: 16,
        padding: 28,
        maxWidth: 480,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#250835" }}>Notifications</div>
          <div style={{ fontSize: 13.5, color: "#6a5b72", marginTop: 2 }}>
            Get notified about new brand matches, replies, and booked calls.
          </div>
        </div>
        <button
          role="switch"
          aria-checked={notificationsEnabled}
          onClick={toggle}
          disabled={saving}
          style={{
            flex: "none",
            width: 46,
            height: 26,
            borderRadius: 999,
            border: "none",
            background: notificationsEnabled ? "#ab2fed" : "#ebe6ee",
            position: "relative",
            cursor: saving ? "default" : "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: notificationsEnabled ? 23 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              transition: "left .15s ease",
              boxShadow: "0 1px 3px rgba(37,8,53,.35)",
            }}
          />
        </button>
      </div>
      {savedAt && (
        <p style={{ marginTop: 16, fontSize: 13, color: "#1B7A3D" }}>
          Saved to your account. Reload the page — it&apos;ll still be {notificationsEnabled ? "on" : "off"}.
        </p>
      )}
    </div>
  );
}
