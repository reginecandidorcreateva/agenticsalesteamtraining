import Link from "next/link";

export default function ProfilePage() {
  return (
    <div style={{ maxWidth: 560 }}>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "#250835",
          margin: "0 0 8px",
        }}
      >
        Profile
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 20 }}>
        A fuller profile page is coming soon. For now, your creator profile lives in your Media Kit.
      </p>
      <Link
        href="/media-kit"
        style={{
          display: "inline-block",
          background: "#250835",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 12,
          padding: "10px 22px",
        }}
      >
        Edit your Media Kit
      </Link>
    </div>
  );
}
