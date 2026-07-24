export default function ComingSoon({ title, description }: { title: string; description: string }) {
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
        {title}
      </h1>
      <div
        style={{
          background: "#fff",
          border: "1px solid #ebe6ee",
          borderRadius: 16,
          padding: 32,
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#ab2fed",
            background: "#decaff",
            borderRadius: 9999,
            padding: "5px 12px",
            marginBottom: 14,
          }}
        >
          COMING SOON
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#6a5b72", margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}
