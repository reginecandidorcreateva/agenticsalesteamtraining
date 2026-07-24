"use client";
import type { Meeting } from "./types";
import { localDateKey } from "./dateKey";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Cell {
  date: Date;
  inMonth: boolean;
}

function buildCells(month: Date): Cell[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstOfMonth = new Date(year, m, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, m, 0).getDate();

  const cells: Cell[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, m - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, m, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

export default function CalendarGrid({
  month,
  meetings,
  selectedKey,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  month: Date;
  meetings: Meeting[];
  selectedKey: string;
  onSelectDay: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const cells = buildCells(month);
  const todayKey = localDateKey(new Date());

  const meetingsByDay = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const key = localDateKey(new Date(m.startsAt));
    const list = meetingsByDay.get(key) ?? [];
    list.push(m);
    meetingsByDay.set(key, list);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid #ebe6ee" }}>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 17, color: "#250835" }}>
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={onToday} style={navBtnStyle}>
            Today
          </button>
          <button onClick={onPrevMonth} aria-label="Previous month" style={navBtnStyle}>
            ‹
          </button>
          <button onClick={onNextMonth} aria-label="Next month" style={navBtnStyle}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ fontSize: 11.5, fontWeight: 700, color: "#a79bb0", textAlign: "center", padding: "8px 0", borderBottom: "1px solid #ebe6ee" }}>
            {w}
          </div>
        ))}

        {cells.map((cell, i) => {
          const key = localDateKey(cell.date);
          const dayMeetings = meetingsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={i}
              onClick={() => onSelectDay(cell.date)}
              style={{
                textAlign: "left",
                minHeight: 88,
                padding: "6px 6px",
                border: "none",
                borderRight: (i + 1) % 7 !== 0 ? "1px solid #f5f4f5" : "none",
                borderBottom: "1px solid #f5f4f5",
                background: isSelected ? "#faf6ff" : "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  fontSize: 12.5,
                  fontWeight: isToday ? 800 : 500,
                  color: cell.inMonth ? (isToday ? "#fff" : "#250835") : "#c9c2cf",
                  background: isToday ? "#ab2fed" : "transparent",
                }}
              >
                {cell.date.getDate()}
              </span>
              {dayMeetings.slice(0, 2).map((m) => (
                <span
                  key={m.id}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#473054",
                    background: "#decaff",
                    borderRadius: 5,
                    padding: "2px 5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(m.startsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} {m.brandName}
                </span>
              ))}
              {dayMeetings.length > 2 && (
                <span style={{ fontSize: 10, color: "#a79bb0", paddingLeft: 5 }}>+{dayMeetings.length - 2} more</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#473054",
  background: "#f5f4f5",
  border: "1px solid #ebe6ee",
  borderRadius: 8,
  padding: "5px 11px",
  cursor: "pointer",
};
