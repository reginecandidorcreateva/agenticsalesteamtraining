"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import PlatformsInput from "@/components/PlatformsInput";
import { EMPTY_MEDIA_KIT, type MediaKit } from "@/lib/mediaKit";

const STEPS = ["welcome", "niche", "audience", "platforms", "tone", "deals", "rate", "review"] as const;

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #ebe6ee",
  fontSize: 15,
  color: "#250835",
  marginTop: 10,
  fontFamily: "inherit",
};

const primaryBtn: CSSProperties = {
  background: "#250835",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 12,
  padding: "11px 24px",
  border: "none",
  cursor: "pointer",
};

const secondaryBtn: CSSProperties = {
  background: "transparent",
  color: "#473054",
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 12,
  padding: "11px 20px",
  border: "1px solid #ebe6ee",
  cursor: "pointer",
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [kit, setKit] = useState<MediaKit>(EMPTY_MEDIA_KIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/media-kit")
      .then((r) => r.json())
      .then((data: MediaKit) => {
        setKit({ ...data, platforms: data.platforms.length ? data.platforms : [{ platform: "", followers: "" }] });
      })
      .finally(() => setLoading(false));
  }, []);

  async function finish() {
    setSaving(true);
    await fetch("/api/media-kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...kit, onboardingCompleted: true }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6a5b72" }}>Loading…</p>
      </div>
    );
  }

  const last = step === STEPS.length - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f4f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 18px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        {step > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#a79bb0" }}>
              Step {step} of {STEPS.length - 1}
            </div>
            <button
              onClick={finish}
              disabled={saving}
              style={{ fontSize: 12.5, fontWeight: 600, color: "#a79bb0", background: "none", border: "none", cursor: "pointer" }}
            >
              Skip for now →
            </button>
          </div>
        )}
        {step > 0 && (
          <div style={{ height: 4, background: "#ebe6ee", borderRadius: 999, marginBottom: 28, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(step / (STEPS.length - 1)) * 100}%`,
                background: "#ab2fed",
                borderRadius: 999,
                transition: "width .2s ease",
              }}
            />
          </div>
        )}

        <div
          style={{
            background: "#fff",
            border: "1px solid #ebe6ee",
            borderRadius: 20,
            padding: 40,
            boxShadow: "rgba(37, 8, 53, 0.08) 0px 20px 40px -8px",
          }}
        >
          {STEPS[step] === "welcome" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "#ab2fed",
                  background: "#decaff",
                  borderRadius: 9999,
                  padding: "6px 14px",
                  marginBottom: 18,
                }}
              >
                LET&apos;S GET YOU SET UP
              </div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 12px" }}>
                Welcome! Let&apos;s build your Media Kit.
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "#6a5b72", margin: "0 0 28px" }}>
                A few quick questions about your niche, audience, and rates — this is what your agents use to find
                and pitch the right brands for you. Takes about 2 minutes.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button style={primaryBtn} onClick={() => setStep(1)}>
                  Let&apos;s go
                </button>
                <button style={secondaryBtn} onClick={finish} disabled={saving}>
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {STEPS[step] === "niche" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                What&apos;s your niche?
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 4px" }}>
                What do you create content about?
              </p>
              <input
                autoFocus
                style={fieldStyle}
                value={kit.niche}
                onChange={(e) => setKit({ ...kit, niche: e.target.value })}
                placeholder="e.g. skincare & wellness"
              />
            </div>
          )}

          {STEPS[step] === "audience" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                Tell us about your audience.
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 4px" }}>
                Age range, location, interests — whatever brands would want to know.
              </p>
              <textarea
                autoFocus
                style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
                value={kit.audience}
                onChange={(e) => setKit({ ...kit, audience: e.target.value })}
                placeholder="e.g. mostly 18-34, US-based, into skincare and slow living"
              />
            </div>
          )}

          {STEPS[step] === "platforms" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                Where do you post, and to how many people?
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 12px" }}>
                Add each platform you&apos;re active on.
              </p>
              <PlatformsInput value={kit.platforms} onChange={(platforms) => setKit({ ...kit, platforms })} />
            </div>
          )}

          {STEPS[step] === "tone" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                What&apos;s your tone or vibe?
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 4px" }}>
                This helps agents pitch and write in your voice.
              </p>
              <input
                autoFocus
                style={fieldStyle}
                value={kit.tone}
                onChange={(e) => setKit({ ...kit, tone: e.target.value })}
                placeholder="e.g. playful, relatable, a little chaotic"
              />
            </div>
          )}

          {STEPS[step] === "deals" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                Any brand deals you&apos;ve already done?
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 4px" }}>
                Optional — helps build credibility with new brands. Skip if this is your first.
              </p>
              <textarea
                autoFocus
                style={{ ...fieldStyle, minHeight: 100, resize: "vertical" }}
                value={kit.dealsDone}
                onChange={(e) => setKit({ ...kit, dealsDone: e.target.value })}
                placeholder="e.g. Glossier (IG post, 2025), Fable Skincare (3-post series)"
              />
            </div>
          )}

          {STEPS[step] === "rate" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                What&apos;s your rate floor?
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 4px" }}>
                The minimum you&apos;ll accept — agents won&apos;t pitch below this.
              </p>
              <input
                autoFocus
                style={fieldStyle}
                value={kit.rateFloor}
                onChange={(e) => setKit({ ...kit, rateFloor: e.target.value })}
                placeholder="e.g. $1,500 minimum per post"
              />
            </div>
          )}

          {STEPS[step] === "review" && (
            <div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835", margin: "0 0 6px" }}>
                Looking good. Here&apos;s your Media Kit.
              </h2>
              <p style={{ fontSize: 14, color: "#6a5b72", margin: "0 0 18px" }}>
                You can always edit this later from your Profile.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                <ReviewRow label="Niche" value={kit.niche || "—"} />
                <ReviewRow label="Audience" value={kit.audience || "—"} />
                <ReviewRow
                  label="Platforms"
                  value={
                    kit.platforms.filter((p) => p.platform).length
                      ? kit.platforms
                          .filter((p) => p.platform)
                          .map((p) => `${p.platform}${p.followers ? ` (${p.followers})` : ""}`)
                          .join(", ")
                      : "—"
                  }
                />
                <ReviewRow label="Tone / vibe" value={kit.tone || "—"} />
                <ReviewRow label="Deals done" value={kit.dealsDone || "—"} />
                <ReviewRow label="Rate floor" value={kit.rateFloor || "—"} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            <div>
              {step > 0 && (
                <button style={secondaryBtn} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
            </div>
            {step > 0 && (
              <button style={primaryBtn} disabled={saving} onClick={() => (last ? finish() : setStep(step + 1))}>
                {last ? (saving ? "Saving…" : "Finish setup") : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: "1px solid #f5f4f5", paddingBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a79bb0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
        {label}
      </div>
      <div style={{ color: "#250835", marginTop: 2 }}>{value}</div>
    </div>
  );
}
