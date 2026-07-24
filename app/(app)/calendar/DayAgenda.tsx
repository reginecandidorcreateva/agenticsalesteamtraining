"use client";
import type { Meeting } from "./types";
import MeetingRow from "./MeetingRow";

export default function DayAgenda({
  date,
  meetings,
  onCancel,
}: {
  date: Date;
  meetings: Meeting[];
  onCancel: (id: number) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#250835", marginBottom: 10 }}>
        {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </div>
      {meetings.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#a79bb0" }}>Nothing booked this day.</p>
      ) : (
        meetings
          .slice()
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          .map((m) => <MeetingRow key={m.id} meeting={m} onCancel={onCancel} />)
      )}
    </div>
  );
}
