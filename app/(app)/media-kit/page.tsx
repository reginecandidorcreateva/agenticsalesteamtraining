import MediaKitForm from "./MediaKitForm";

export default function MediaKitPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "#250835",
          margin: "0 0 8px",
        }}
      >
        Your Media Kit
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 28 }}>
        This is saved to your account — it&apos;ll be here next time you sign in, on any device.
      </p>

      <MediaKitForm />
    </div>
  );
}
