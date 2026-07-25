import Link from "next/link";

const h2 = {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 18,
  color: "#250835",
  margin: "32px 0 10px",
};
const p = { fontSize: 14.5, lineHeight: 1.7, color: "#6a5b72", margin: "0 0 10px" };

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p style={{ fontSize: 13.5, color: "#a79bb0", marginBottom: 20 }}>Last updated July 25, 2026</p>

      <p style={p}>
        These terms cover your use of Agentic Sales Team, a tool for individual content creators to manage brand
        deals with the help of AI helpers. By creating an account, you agree to these terms.
      </p>

      <h2 style={h2}>The service</h2>
      <p style={p}>
        Agentic Sales Team lets you build a creator profile (your Media Kit), track brand deals on a pipeline
        board, and use AI helpers to research brands, draft pitches, proposals, and follow-ups, and book calls. You
        may optionally connect a TikTok account to auto-fill your follower count and profile photo.
      </p>

      <h2 style={h2}>AI-generated content</h2>
      <p style={p}>
        Pitches, proposals, follow-ups, research, and other content produced by your AI helpers are drafts based on
        the information you provide. You are responsible for reviewing anything an AI helper drafts before you send
        it to a brand, sign it, or otherwise rely on it — we don&apos;t guarantee its accuracy or outcome.
      </p>

      <h2 style={h2}>Your responsibilities</h2>
      <p style={p}>
        You&apos;re responsible for the accuracy of the information you enter (your Media Kit, brand details, and
        anything you send through the app), and for using the app in a way that doesn&apos;t violate the law or
        the rights of any brand, platform, or third party. Don&apos;t use the app to send spam or misleading
        outreach.
      </p>

      <h2 style={h2}>Accounts</h2>
      <p style={p}>
        You&apos;re responsible for keeping your login credentials secure. You can request deletion of your
        account and data at any time via our{" "}
        <a href="/contact" style={{ color: "#ab2fed" }}>
          contact page
        </a>
        .
      </p>

      <h2 style={h2}>No warranty</h2>
      <p style={p}>
        The app is provided &quot;as is,&quot; without warranties of any kind. We aren&apos;t liable for lost
        deals, missed opportunities, or other damages arising from your use of the app or reliance on AI-generated
        content.
      </p>

      <h2 style={h2}>Changes</h2>
      <p style={p}>
        We may update these terms as the app evolves. Continued use of the app after a change means you accept the
        updated terms.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        Questions about these terms? Reach out via{" "}
        <a href="/contact" style={{ color: "#ab2fed" }}>
          our contact page
        </a>
        .
      </p>
    </div>
  );
}
