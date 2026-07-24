import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import HomeClient from "./HomeClient";

const FEATURES = [
  {
    icon: "research",
    tint: "#decaff",
    title: "Finds brands for you",
    desc: "Your Research agent scouts real brands that sponsor creators in your niche and drops them into a Pending area for you to approve.",
  },
  {
    icon: "email",
    tint: "#e9bded",
    title: "Pitches in your voice",
    desc: "Click a brand and an agent writes a personalized first-touch pitch as you — an email if they have one, a short DM if not.",
  },
  {
    icon: "writing",
    tint: "#bbcfe4",
    title: "Drafts priced proposals",
    desc: "Turn interest into a scoped, priced proposal grounded in your niche, audience, and rate floor — no generic boilerplate.",
  },
  {
    icon: "call",
    tint: "#decaff",
    title: "Follows up so you don't have to",
    desc: "A brand gone quiet? Your Follow-up agent sends a short, polite nudge that builds on what was already said.",
  },
  {
    icon: "meeting",
    tint: "#e9bded",
    title: "Books the call",
    desc: "Say it in plain English — \"book a call with Acme next Tuesday at 2pm\" — and it lands on your calendar.",
  },
  {
    icon: "analytics",
    tint: "#bbcfe4",
    title: "Shows your team at work",
    desc: "The live dashboard shows your agents working in real time — pitches drafted, brands worked, calls booked.",
  },
];

const STEPS = [
  { n: "01", title: "Fill in your Media Kit", desc: "Your niche, audience, platforms, and rates — the profile every agent grounds its work in." },
  { n: "02", title: "Meet your AI team", desc: "Five ready-made agents, each with one job: research, outreach, proposals, follow-up, and scheduling." },
  { n: "03", title: "They find and pitch brands", desc: "Agents discover brands, vet them, and draft personalized pitches in your own voice." },
  { n: "04", title: "You approve and book", desc: "Review what they find, open pitches in your own mail app to send, and watch calls land on your calendar." },
];

function FeatureIcon({ type, tint }: { type: string; tint: string }) {
  const glyphs: Record<string, string> = {
    research: '<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="m3.6 6.5 8.4 6 8.4-6"/>',
    writing: '<path d="M4 20l1-4L15.4 5.6a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1L8 19l-4 1Z"/><path d="m13.5 7.5 3 3"/>',
    call: '<path d="M15.6 13.7c-1 1-1 1-2 .5a11 11 0 0 1-3.8-3.8c-.5-1-.5-1 .5-2 .6-.6.7-1 .3-1.8l-1-2.2c-.3-.6-.8-.8-1.4-.6C6.6 4.3 5.6 5.6 5.6 7c0 5.6 5.4 11 11 11 1.4 0 2.7-1 3.2-2.4.2-.6 0-1.1-.6-1.4l-2.2-1c-.7-.4-1.1-.3-1.7.3Z"/>',
    meeting: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>',
    analytics: '<path d="M4 5v15h16"/><path d="m7.5 14.5 3-3.5 3 2 4-5.5"/>',
  };
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 8,
        background: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#250835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: glyphs[type] }} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: "#ffffff" }}>
      <style>{`
        @media (max-width: 640px) {
          .landing-nav-links { display: none !important; }
          .landing-logo { font-size: 16px !important; }
          .landing-header-actions { gap: 10px !important; }
        }
      `}</style>
      {/* Nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#ffffff",
          borderBottom: "1px solid #ebe6ee",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 18px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="landing-logo" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#250835", flex: "none" }}>
            Agentic Sales Team
          </div>
          <nav className="landing-nav-links" style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500, color: "#250835" }}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#who-its-for">Who it&apos;s for</a>
            <Show when="signed-in">
              <Link href="/dashboard">Dashboard</Link>
            </Show>
          </nav>
          <div className="landing-header-actions" style={{ display: "flex", alignItems: "center", gap: 16, flex: "none" }}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button style={{ fontSize: 14, fontWeight: 500, color: "#473054", background: "none", border: "none", cursor: "pointer" }}>
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  style={{
                    background: "#250835",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 12,
                    padding: "9px 18px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 18px 40px", textAlign: "center" }}>
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
            marginBottom: 20,
          }}
        >
          YOUR AI TALENT-MANAGEMENT TEAM
        </div>
        <h1
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 72px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#250835",
            margin: "0 0 20px",
          }}
        >
          Your brand deals,
          <br />
          worked while you create.
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: "#6a5b72",
            maxWidth: 620,
            margin: "0 auto 32px",
          }}
        >
          Agentic Sales Team is a crew of AI agents that find brands, research them, pitch in your voice, draft
          proposals, follow up, and book the call — so you can focus on making things.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
          <a
            href="#"
            style={{
              background: "#250835",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              padding: "12px 24px",
            }}
          >
            Sign up free
          </a>
          <a
            href="#how-it-works"
            style={{
              background: "transparent",
              color: "#473054",
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 12,
              padding: "12px 24px",
              border: "1px solid #473054",
            }}
          >
            See how it works
          </a>
        </div>

        {/* The star of the show */}
        <HomeClient />
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 18px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              color: "#250835",
              margin: "0 0 12px",
            }}
          >
            A full team, without the headcount
          </h2>
          <p style={{ fontSize: 16, color: "#6a5b72", maxWidth: 560, margin: "0 auto" }}>
            Every agent does one job well, grounded in your Media Kit — your niche, audience, and rates.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#fff",
                border: "1px solid #ebe6ee",
                borderRadius: 16,
                padding: 40,
                boxShadow: "rgba(37, 8, 53, 0.06) 0px 16px 32px -4px",
              }}
            >
              <FeatureIcon type={f.icon} tint={f.tint} />
              <h3
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#250835",
                  margin: "0 0 10px",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: "#6a5b72", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: "#f5f4f5", padding: "80px 18px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 48px)",
                letterSpacing: "-0.02em",
                color: "#250835",
                margin: "0 0 12px",
              }}
            >
              How it works
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {STEPS.map((s) => (
              <div key={s.n}>
                <div
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 800,
                    fontSize: 32,
                    color: "#decaff",
                    marginBottom: 8,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#250835",
                    margin: "0 0 8px",
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#6a5b72", margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 18px", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 48px)",
            letterSpacing: "-0.02em",
            color: "#250835",
            margin: "0 0 20px",
          }}
        >
          Built for creators, not agencies
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "#6a5b72", maxWidth: 640, margin: "0 auto" }}>
          If you&apos;re a content creator who wants brand deals but doesn&apos;t have the time — or a human manager
          — to chase them, this is your team. No spreadsheets, no cold-DM guesswork. Just tell it what you want
          and watch the pipeline fill in.
        </p>
      </section>

      {/* Closing CTA */}
      <section style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 18px" }}>
        <div
          style={{
            background: "linear-gradient(97deg, #3ca1ff 5.54%, #c852ff 49.85%, #ff60f0 94.14%)",
            borderRadius: 24,
            padding: "64px 40px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Let your team start working the book.
          </h2>
          <p style={{ fontSize: 16, color: "#fff", opacity: 0.95, margin: "0 0 28px" }}>
            Free to start. Set up your Media Kit and meet your team in minutes.
          </p>
          <a
            href="#"
            style={{
              display: "inline-block",
              background: "#250835",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 12,
              padding: "12px 26px",
            }}
          >
            Sign up free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #ebe6ee", padding: "32px 18px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 15, color: "#250835" }}>
            Agentic Sales Team
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/contact" style={{ fontSize: 13, color: "#6a5b72" }}>
              Contact support
            </Link>
            <div style={{ fontSize: 13, color: "#6a5b72" }}>
              © {new Date().getFullYear()} Agentic Sales Team. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
