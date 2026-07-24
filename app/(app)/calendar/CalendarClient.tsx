"use client";
import { useEffect, useState } from "react";
import type { Meeting } from "./types";
import CalendarGrid from "./CalendarGrid";
import DayAgenda from "./DayAgenda";
import { localDateKey } from "./dateKey";

export default function CalendarClient() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((data) => {
        setMeetings(data);
        setLoading(false);
      });
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBooking(true);
    setError("");
    const res = await fetch("/api/meetings/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setBooking(false);
    if (res.ok) {
      setMeetings((prev) => [...prev, data.meeting]);
      const bookedDate = new Date(data.meeting.startsAt);
      setMonth(bookedDate);
      setSelectedDate(bookedDate);
      setText("");
    } else {
      setError(data.error || "Something went wrong.");
    }
  }

  async function cancelMeeting(id: number) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
  }

  function shiftMonth(delta: number) {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToday() {
    const now = new Date();
    setMonth(now);
    setSelectedDate(now);
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      setMonth(date);
    }
  }

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your calendar…</p>;

  const selectedKey = localDateKey(selectedDate);
  const selectedDayMeetings = meetings.filter((m) => localDateKey(new Date(m.startsAt)) === selectedKey);

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 4px" }}>
        Calendar
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 24 }}>
        Every booked brand call, in one place.
      </p>

      <form
        onSubmit={handleBook}
        style={{
          background: "#faf6ff",
          border: "1px solid #decaff",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#250835" }}>
          Book a call, in plain English
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g. "book a call with Acme next Tuesday at 2pm"'
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ebe6ee",
                fontSize: 14,
                color: "#250835",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={booking || !text.trim()}
              style={{
                background: "#250835",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
                padding: "10px 20px",
                border: "none",
                cursor: booking ? "default" : "pointer",
                opacity: booking ? 0.6 : 1,
                flex: "none",
              }}
            >
              {booking ? "Booking…" : "Book"}
            </button>
          </div>
        </label>
        {error && <p style={{ fontSize: 13, color: "#B91C1C", marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20, alignItems: "start" }}>
        <CalendarGrid
          month={month}
          meetings={meetings}
          selectedKey={selectedKey}
          onSelectDay={selectDay}
          onPrevMonth={() => shiftMonth(-1)}
          onNextMonth={() => shiftMonth(1)}
          onToday={goToday}
        />
        <DayAgenda date={selectedDate} meetings={selectedDayMeetings} onCancel={cancelMeeting} />
      </div>
    </div>
  );
}
