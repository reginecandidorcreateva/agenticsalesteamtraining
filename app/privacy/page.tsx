import Link from "next/link";

const h2 = {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 18,
  color: "#250835",
  margin: "32px 0 10px",
};
const p = { fontSize: 14.5, lineHeight: 1.7, color: "#6a5b72", margin: "0 0 10px" };

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 18px 80px" }}>
      <Link href="/" style={{ fontSize: 14, color: "#6a5b72" }}>
        ← Back home
      </Link>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 32,
          color: "#250835",
          margin: "16px 0 6px",
        }}
      >
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13.5, color: "#a79bb0", marginBottom: 20 }}>Last updated July 25, 2026</p>

      <p style={p}>
        Agentic Sales Team (&quot;the app&quot;) is a tool that helps individual content creators manage brand
        deals with the help of AI helpers. This page explains what information we collect and how it&apos;s used.
      </p>

      <h2 style={h2}>What we collect</h2>
      <p style={p}>
        <strong>Account information:</strong> your email address and login details, handled by our authentication
        provider, Clerk. We never see or store your password.
      </p>
      <p style={p}>
        <strong>Your Media Kit:</strong> the profile details you enter yourself — niche, audience, platforms and
        follower counts, tone, past deals, and rate floor.
      </p>
      <p style={p}>
        <strong>Brand deal data:</strong> brands you add or your AI helpers discover, along with any pitches,
        proposals, follow-ups, and meetings generated for those brands.
      </p>
      <p style={p}>
        <strong>TikTok profile data (only if you connect it):</strong> if you choose to connect your TikTok
        account, we receive your TikTok display name, profile photo, and follower count, which we use solely to
        fill in your Media Kit and display your photo on your dashboard. We do not post to TikTok on your behalf,
        and we do not access your TikTok content, messages, or followers list.
      </p>

      <h2 style={h2}>How we use it</h2>
      <p style={p}>
        Your information is used only to operate the app for you: powering your AI helpers, populating your
        dashboard and analytics, and auto-filling your profile. We do not sell your data, and we do not share it
        with third parties for advertising.
      </p>

      <h2 style={h2}>Service providers</h2>
      <p style={p}>
        We rely on a small set of providers to run the app: Clerk (sign-in), Neon (database storage), Groq (the AI
        model that drafts pitches, proposals, and research), Firecrawl (web search for brand research), Resend
        (sending support emails), and TikTok (only for accounts that choose to connect it). Each only receives the
        minimum data needed to perform its function.
      </p>

      <h2 style={h2}>Data retention and deletion</h2>
      <p style={p}>
        Your data is kept as long as your account is active. To request that your account and all associated data
        be deleted, contact us at{" "}
        <a href="/contact" style={{ color: "#ab2fed" }}>
          our support page
        </a>
        .
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        Questions about this policy? Reach out via{" "}
        <a href="/contact" style={{ color: "#ab2fed" }}>
          our contact page
        </a>
        .
      </p>
    </div>
  );
}
