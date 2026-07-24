"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import type { ReactNode } from "react";
import NotificationBell from "@/components/NotificationBell";

const GLYPHS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  brandDeals: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  agents: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c.5-3.5 3-5.5 5.5-5.5s5 2 5.5 5.5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15 20c.3-2.4 1.9-4.2 4-4.5"/>',
  chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>',
  analytics: '<path d="M4 5v15h16"/><path d="m7.5 14.5 3-3.5 3 2 4-5.5"/>',
  profile: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1-4.5 4-7 7.5-7s6.5 2.5 7.5 7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.9 3h-4l-.4 2.9a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.4 11a7.97 7.97 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 2.9h4l.4-2.9a8 8 0 0 0 1.7-1l2.5 1 2-3.4Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/>',
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/brand-deals", label: "Brand Deals", icon: "brandDeals" },
  { href: "/agents", label: "Agents", icon: "agents" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: GLYPHS[name] }}
    />
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [query, setQuery] = useState("");

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Your account";
  const initials = (user?.firstName?.[0] || displayName[0] || "?").toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f4f5" }}>
      <aside
        style={{
          width: 240,
          flex: "none",
          background: "#fff",
          borderRight: "1px solid #ebe6ee",
          display: "flex",
          flexDirection: "column",
          padding: "20px 14px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: "#250835",
            padding: "0 10px",
            marginBottom: 28,
          }}
        >
          Agentic Sales Team
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#ab2fed" : "#473054",
                  background: active ? "#decaff" : "transparent",
                  borderRadius: 10,
                  padding: "9px 12px",
                }}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #ebe6ee", paddingTop: 14, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", marginBottom: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#250835",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              {initials}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#250835", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              color: "#473054",
              background: "#f5f4f5",
              border: "1px solid #ebe6ee",
              borderRadius: 10,
              padding: "9px 12px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: 64,
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "0 28px",
            borderBottom: "1px solid #ebe6ee",
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ position: "relative", width: 340, maxWidth: "100%" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#a79bb0" }}>
              <Icon name="search" size={16} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands, agents, deals..."
              style={{
                width: "100%",
                fontSize: 14,
                color: "#250835",
                background: "#f5f4f5",
                border: "1px solid #ebe6ee",
                borderRadius: 10,
                padding: "9px 12px 9px 36px",
              }}
            />
          </div>
          <NotificationBell />
        </header>

        <main style={{ flex: 1, padding: "32px 28px" }}>{children}</main>
      </div>
    </div>
  );
}
