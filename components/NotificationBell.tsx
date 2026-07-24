"use client";
import { useEffect, useState } from "react";

interface NotificationItem {
  id: number;
  agentId: number;
  agentName: string;
  task: string;
  isError: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setUnreadCount(0);
      fetch("/api/notifications/seen", { method: "POST" }).catch(() => {});
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid #ebe6ee",
          background: "#f5f4f5",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#473054",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "#ab2fed",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 44,
              width: 340,
              maxHeight: 420,
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #ebe6ee",
              borderRadius: 14,
              boxShadow: "rgba(37, 8, 53, 0.18) 0px 16px 32px -8px",
              zIndex: 21,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#250835", padding: "6px 8px 10px" }}>Recent activity</div>
            {items.length === 0 ? (
              <p style={{ fontSize: 13, color: "#a79bb0", padding: "0 8px 8px" }}>Nothing yet — run a helper to see it here.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} style={{ padding: "8px 8px", borderRadius: 10, marginBottom: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: item.isError ? "#B91C1C" : "#ab2fed" }}>{item.agentName}</span>
                    <span style={{ fontSize: 11, color: "#a79bb0", flex: "none" }}>{timeAgo(item.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#473054", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.task}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
