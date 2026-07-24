"use client";
import { useState } from "react";
import type { Brand } from "./types";
import { primaryBtnSmall } from "./styles";

export default function BookCallPanel({ brand, onUpdate }: { brand: Brand; onUpdate: (b: Brand) => void }) {
  const [when, setWhen] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  async function book() {
    if (!when) return;
    setBooking(true);
    setError("");
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brand.id, brandName: brand.name, startsAt: when }),
    });
    const data = await res.json();
    setBooking(false);
    if (res.ok) {
      setConfirmedAt(data.meeting.startsAt);
      if (data.brand) onUpdate(data.brand);
      setWhen("");
    } else {
      setError(data.error || "Something went wrong.");
    }
  }

  return (
    <div style={{ borderTop: "1px solid #f5f4f5", paddingTop: 18, marginTop: 18 }}>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#250835", marginBottom: 8 }}>Book a call</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "9px 11px",
            borderRadius: 9,
            border: "1px solid #ebe6ee",
            fontSize: 14,
            color: "#250835",
            fontFamily: "inherit",
          }}
        />
        <button onClick={book} disabled={booking || !when} style={{ ...primaryBtnSmall, opacity: booking || !when ? 0.5 : 1 }}>
          {booking ? "Booking…" : "Book"}
        </button>
      </div>
      {error && <p style={{ fontSize: 12.5, color: "#B91C1C", marginTop: 8 }}>{error}</p>}
      {confirmedAt && (
        <p style={{ fontSize: 12.5, color: "#1B7A3D", marginTop: 8 }}>
          Booked for {new Date(confirmedAt).toLocaleString()} — see it on your Calendar.
        </p>
      )}
    </div>
  );
}
