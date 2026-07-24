"use client";
import type { Meeting } from "./types";

export default function MeetingRow({ meeting, onCancel }: { meeting: Meeting; onCancel: (id: number) => void }) {
  const date = new Date(meeting.startsAt);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: "#fff",
        border: "1px solid #ebe6ee",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#250835" }}>
          {meeting.brandName}
          {meeting.brandId && (
            <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, color: "#ab2fed", background: "#decaff", borderRadius: 999, padding: "2px 8px" }}>
              linked
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: "#6a5b72", marginTop: 2 }}>
          {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at{" "}
          {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </div>
        {meeting.notes && <div style={{ fontSize: 12.5, color: "#a79bb0", marginTop: 4 }}>{meeting.notes}</div>}
      </div>
      <button
        onClick={() => onCancel(meeting.id)}
        style={{ fontSize: 12.5, color: "#a79bb0", background: "none", border: "1px solid #ebe6ee", borderRadius: 9, padding: "7px 14px", cursor: "pointer", flex: "none" }}
      >
        Cancel
      </button>
    </div>
  );
}
