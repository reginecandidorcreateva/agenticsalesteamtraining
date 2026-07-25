"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import PlatformsInput from "@/components/PlatformsInput";
import { EMPTY_MEDIA_KIT, type MediaKit } from "@/lib/mediaKit";

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ebe6ee",
  fontSize: 14,
  color: "#250835",
  marginTop: 6,
  marginBottom: 18,
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#250835" };

interface TikTokConnection {
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
}

export default function MediaKitForm() {
  const [kit, setKit] = useState<MediaKit>(EMPTY_MEDIA_KIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [tiktok, setTiktok] = useState<TikTokConnection | null>(null);
  const [tiktokBanner, setTiktokBanner] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/media-kit")
      .then((r) => r.json())
      .then((data: MediaKit) => {
        setKit({ ...data, platforms: data.platforms.length ? data.platforms : [{ platform: "", followers: "" }] });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("tiktok");
    if (status) {
      setTiktokBanner(status);
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetch("/api/tiktok/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setTiktok(data.connection);
          // Pick up the freshly-synced follower count without a full page reload.
          fetch("/api/media-kit")
            .then((r) => r.json())
            .then((k: MediaKit) => setKit((prev) => ({ ...prev, platforms: k.platforms })));
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/media-kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kit),
    });
    const data = await res.json();
    setKit(data);
    setSavedAt(data.updatedAt);
    setSaving(false);
  }

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your Media Kit…</p>;

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 520 }}>
      <label style={labelStyle}>
        Niche
        <input
          style={fieldStyle}
          value={kit.niche}
          onChange={(e) => setKit({ ...kit, niche: e.target.value })}
          placeholder="e.g. skincare & wellness"
        />
      </label>
      <label style={labelStyle}>
        Audience
        <textarea
          style={{ ...fieldStyle, minHeight: 70, resize: "vertical" }}
          value={kit.audience}
          onChange={(e) => setKit({ ...kit, audience: e.target.value })}
          placeholder="e.g. mostly 18-34, US-based, into skincare and slow living"
        />
      </label>
      <label style={labelStyle}>Platforms & followers</label>
      <div style={{ marginTop: 6, marginBottom: 12 }}>
        <PlatformsInput
          value={kit.platforms}
          onChange={(platforms) => setKit({ ...kit, platforms })}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #ebe6ee",
          background: "#faf6ff",
          marginBottom: 18,
        }}
      >
        {tiktok ? (
          <>
            {tiktok.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tiktok.avatarUrl}
                alt=""
                width={40}
                height={40}
                style={{ borderRadius: "50%", objectFit: "cover", flex: "none" }}
              />
            )}
            <div style={{ fontSize: 13, color: "#250835" }}>
              <div style={{ fontWeight: 700 }}>TikTok connected{tiktok.displayName ? ` — @${tiktok.displayName}` : ""}</div>
              <div style={{ color: "#6a5b72" }}>
                {typeof tiktok.followerCount === "number"
                  ? `${tiktok.followerCount.toLocaleString("en-US")} followers, synced automatically above.`
                  : "Synced automatically above."}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "#250835", flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Connect TikTok</div>
              <div style={{ color: "#6a5b72" }}>Auto-fill your follower count here and your photo on the Dashboard.</div>
            </div>
            <a
              href="/api/tiktok/connect"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: "#250835",
                borderRadius: 10,
                padding: "8px 16px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Connect TikTok
            </a>
          </>
        )}
      </div>
      {tiktokBanner === "connected" && (
        <p style={{ fontSize: 13, color: "#1B7A3D", marginTop: -12, marginBottom: 18 }}>TikTok connected — your stats are synced above.</p>
      )}
      {tiktokBanner === "denied" && (
        <p style={{ fontSize: 13, color: "#6a5b72", marginTop: -12, marginBottom: 18 }}>TikTok connection cancelled.</p>
      )}
      {tiktokBanner === "error" && (
        <p style={{ fontSize: 13, color: "#B91C1C", marginTop: -12, marginBottom: 18 }}>
          Something went wrong connecting TikTok. Please try again.
        </p>
      )}

      <label style={labelStyle}>
        Tone / vibe
        <input
          style={fieldStyle}
          value={kit.tone}
          onChange={(e) => setKit({ ...kit, tone: e.target.value })}
          placeholder="e.g. playful, relatable, a little chaotic"
        />
      </label>
      <label style={labelStyle}>
        Deals you&apos;ve done
        <textarea
          style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
          value={kit.dealsDone}
          onChange={(e) => setKit({ ...kit, dealsDone: e.target.value })}
          placeholder="e.g. Glossier (IG post, 2025), Fable Skincare (3-post series)"
        />
      </label>
      <label style={labelStyle}>
        Rate floor
        <input
          style={fieldStyle}
          value={kit.rateFloor}
          onChange={(e) => setKit({ ...kit, rateFloor: e.target.value })}
          placeholder="e.g. $1,500 minimum per post"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        style={{
          background: "#250835",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 12,
          padding: "10px 22px",
          border: "none",
          cursor: saving ? "default" : "pointer",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Saving…" : "Save Media Kit"}
      </button>
      {savedAt && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#1B7A3D" }}>
          Saved to your account at {new Date(savedAt).toLocaleTimeString()}. Reload the page — it&apos;ll still be here.
        </p>
      )}
    </form>
  );
}
