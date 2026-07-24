import Link from "next/link";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 18px" }}>
      <Link href="/" style={{ fontSize: 14, color: "#6a5b72" }}>
        ← Back home
      </Link>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 32,
          color: "#250835",
          margin: "16px 0 8px",
        }}
      >
        Contact support
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 32 }}>
        Locked out, or something not working? Send us a message and we&apos;ll get back to you.
      </p>

      <ContactForm />
    </div>
  );
}
