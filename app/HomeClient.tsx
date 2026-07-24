"use client";
// The signature "agents at work" orbit dashboard.
// Reproduced from 09-dashboard-design.md — layout, sizes, and animations kept verbatim;
// only the skin (colors/fonts) follows the creator's chosen "Whimsical" style.
// At this milestone it renders from the static preset "Deal Team" with demo stats/activity
// (see 07a-the-deal-team.md) — a self-contained showcase. Wired to real data at a later milestone.
import { useEffect, useState } from "react";
import { statusMeta } from "@/lib/data";
import { av, hubIcon } from "@/lib/visuals";
import { css, Box } from "@/components/primitives";
import { AGENT_TYPES, TEAM_TEMPLATES, type AgentType, type TeamTemplate } from "@/lib/agentTypes";
import type { WorkspaceStats, ActivityItem } from "@/lib/workspace/stats";

// [animation, tint] per activity type — the glyph comes from hubIcon().
const hubIcons: Record<string, [string, string]> = {
  email: ["iconFly 2.6s ease-in-out infinite", "#0283ec"],
  call: ["iconRing 1.6s ease-in-out infinite", "#2FA45C"],
  research: ["iconSwing 2.4s ease-in-out infinite", "#F59E0B"],
  writing: ["iconPop 2.4s ease-in-out infinite", "#ab2fed"],
  meeting: ["iconPop 2.8s ease-in-out infinite", "#F43F7E"],
  analytics: ["iconPop 3s ease-in-out infinite", "#4b38ee"],
  idle: ["breathe 3s ease-in-out infinite", "#8A8A94"],
  alert: ["iconPop 1.8s ease-in-out infinite", "#EF4444"],
};

// map an agent to an activity type by its first capability
const typeByCapability: Record<string, string> = {
  scrape: "research",
  research: "research",
  outreach: "email",
  "follow-up": "email",
  proposal: "writing",
  "book-meeting": "meeting",
};

function agentActivityType(a: { capabilities?: string[] }): string {
  return typeByCapability[a.capabilities?.[0] ?? ""] || "writing";
}

// Demo data so the showcase looks alive with no backend yet.
const DEMO_STATS: WorkspaceStats = {
  activeAgents: 3,
  tasksRunning: 5,
  leadsWorked: 18,
  perAgent: [
    { agentId: "discovery", leadsWorked: 9 },
    { agentId: "outreach", leadsWorked: 6 },
    { agentId: "proposal", leadsWorked: 4 },
    { agentId: "followup", leadsWorked: 2 },
    { agentId: "scheduler", leadsWorked: 3 },
  ],
};

const DEMO_ACTIVITY: ActivityItem[] = [
  { agentId: "scheduler", text: "booked a call with Northwind Coffee for Thursday" },
  { agentId: "outreach", text: "drafted a pitch for Solstice Skincare" },
  { agentId: "discovery", text: "found 4 new brands in your niche" },
  { agentId: "proposal", text: "scoped a proposal for Fernweg Travel" },
];

export default function HomeClient({
  agents = AGENT_TYPES,
  teams = TEAM_TEMPLATES,
  stats: ws = DEMO_STATS,
  activity: acts = DEMO_ACTIVITY,
  live = false,
}: {
  agents?: AgentType[];
  teams?: TeamTemplate[];
  stats?: WorkspaceStats;
  activity?: ActivityItem[];
  live?: boolean;
} = {}) {
  function byId(id: string): AgentType | undefined {
    return agents.find((a) => a.id === id);
  }

  const [dims, setDims] = useState({ w: 1280, h: 800 });
  const [reduced, setReduced] = useState(false);
  const [hubTeam, setHubTeam] = useState("all");
  const [tick, setTick] = useState(0);
  const [workingIds, setWorkingIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const poll = () => {
      fetch("/api/dashboard/live")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setWorkingIds(new Set<string>(data.workingAgentIds ?? []));
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live]);

  useEffect(() => {
    const on = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const hub = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(hub);
  }, []);

  const paMap = new Map(ws.perAgent.map((p) => [p.agentId, p]));
  const maxOut = Math.max(1, ...ws.perAgent.map((p) => p.leadsWorked));

  const hubMembers =
    hubTeam === "all"
      ? agents.slice(0, 8)
      : (teams.find((t) => t.id === hubTeam)?.members ?? []).map((id) => byId(id)).filter(Boolean) as AgentType[];
  const HN = Math.max(hubMembers.length, 1);
  const nodes = hubMembers.map((a, i) => {
    const ang = ((-90 + (i * 360) / HN) * Math.PI) / 180;
    const x = Math.round(380 + Math.cos(ang) * 272);
    const y = Math.round(262 + Math.sin(ang) * 186);
    const type = agentActivityType(a);
    const ic = hubIcons[type];
    const liveWorking = workingIds?.has(a.id) ?? false;
    const effectiveStatus = liveWorking ? "working" : a.status;
    const m = statusMeta(effectiveStatus);
    const latest = acts.find((f) => f.agentId === a.id);
    return {
      a,
      i,
      x,
      y,
      m,
      ic,
      type,
      liveWorking,
      badge: liveWorking ? "Working…" : latest ? latest.text.slice(0, 40) : effectiveStatus === "working" ? "Working…" : "Idle",
    };
  });
  const collabs = HN >= 5 ? [[0, 2], [1, 4]] : [];

  const hubWorking = workingIds ? agents.filter((a) => workingIds.has(a.id)).length : ws.activeAgents;
  const leadsWorked = ws.leadsWorked;
  const tasksRunning = ws.tasksRunning;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();

  const actLine = (f?: ActivityItem) => (f ? (byId(f.agentId)?.name ?? "Agent") + " " + f.text : "");
  const hubLive = actLine(acts[0]).slice(0, 90);
  const hubLive2 = actLine(acts[1]).slice(0, 90);

  const hubCardW = Math.max(dims.w - 52 - 2, 320);
  const hubScale = Math.max(0.7, Math.min((dims.h - 250) / 524, (hubCardW - 40) / 760, 1.45));
  const teamPills = [{ id: "all", label: "Everyone" }].concat(teams.map((t) => ({ id: t.id, label: t.name })));

  return (
    <div style={css("display:flex;flex-direction:column;gap:14px;animation:fadeUp .3s ease")}>
      <div
        style={css(
          "position:relative;background:" +
            "linear-gradient(142deg,#ba59ff 0%,#ba59ff 30%,#ff59f1 100%)" +
            ";border:1px solid rgba(37,8,53,.15);border-radius:24px;height:600px;min-height:540px;overflow:hidden;box-shadow:0 20px 50px rgba(37,8,53,.25)"
        )}
      >
        <div style={css("position:absolute;top:16px;left:20px;right:150px;display:flex;gap:8px;z-index:3;flex-wrap:wrap")}>
          {teamPills.map((p) => (
            <Box
              key={p.id}
              onClick={() => setHubTeam(p.id)}
              style={
                "font-size:11.5px;font-weight:600;border-radius:99px;padding:5px 13px;cursor:pointer;transition:all .12s;backdrop-filter:blur(6px);" +
                (hubTeam === p.id
                  ? "background:#fff;color:#250835;border:1px solid #fff"
                  : "background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3)")
              }
              styleHover="border-color:#fff"
            >
              {p.label}
            </Box>
          ))}
        </div>
        {hubWorking > 0 && (
          <div
            style={css(
              "position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#0d3d1f;background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.6);border-radius:99px;padding:4px 12px;z-index:3;backdrop-filter:blur(6px)"
            )}
          >
            <span style={css("width:6px;height:6px;border-radius:50%;background:#2FA45C;animation:pulse 2s infinite")} />
            Working now
          </div>
        )}

        <div
          style={css(
            "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(" +
              hubScale.toFixed(3) +
              ");width:760px;height:524px"
          )}
        >
          <div style={css("position:absolute;left:380px;top:262px;width:560px;height:380px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.25);border-radius:50%")} />
          <div style={css("position:absolute;left:380px;top:262px;width:400px;height:270px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.25);border-radius:50%")} />

          <svg width="760" height="524" viewBox="0 0 760 524" style={{ position: "absolute", left: 0, top: 0 }}>
            {nodes.map((n) => (
              <line
                key={"l" + n.i}
                x1="380"
                y1="262"
                x2={n.x}
                y2={n.y}
                stroke="rgba(255,255,255,.4)"
                strokeWidth="1.5"
                strokeDasharray="3 7"
                style={{ animation: "dashMove 1.8s linear infinite" }}
              />
            ))}
            {!reduced &&
              nodes.map((n) => (
                <circle key={"p" + n.i} r="2.6" fill="#fff" opacity="0.9">
                  <animateMotion
                    dur={2.4 + (n.i % 4) * 0.6 + "s"}
                    begin={n.i * 0.4 + "s"}
                    repeatCount="indefinite"
                    path={"M" + n.x + " " + n.y + " L380 262"}
                  />
                </circle>
              ))}
            {collabs.map((c, i) => (
              <line
                key={"c" + i}
                x1={nodes[c[0]].x}
                y1={nodes[c[0]].y}
                x2={nodes[c[1]].x}
                y2={nodes[c[1]].y}
                stroke="rgba(244,63,126,.7)"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                style={{ animation: "dashMove 1.2s linear infinite" }}
              />
            ))}
          </svg>

          {/* center ring */}
          <div style={css("position:absolute;left:380px;top:262px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2")}>
            <div style={css("position:relative;width:124px;height:124px;display:flex;align-items:center;justify-content:center")}>
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(255,255,255,.65);animation:ringPulse 3s ease-out infinite")} />
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(255,255,255,.65);animation:ringPulse 3s ease-out 1.5s infinite")} />
              <div style={css("width:124px;height:124px;border-radius:50%;background:conic-gradient(#ab2fed 0 100%,rgba(255,255,255,.3) 100% 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 44px rgba(171,47,237,.5)")}>
                <div style={css("width:106px;height:106px;border-radius:50%;background:#250835;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden")}>
                  <div style={css("font-family:'Manrope',sans-serif;font-weight:800;font-size:24px;color:#fff;line-height:1")}>{leadsWorked}</div>
                  <div style={css("font-size:8.5px;font-weight:700;letter-spacing:.1em;color:#decaff;margin-top:4px;text-align:center;line-height:1.4")}>
                    BRANDS WORKED
                    <br />
                    {monthLabel}
                  </div>
                </div>
              </div>
            </div>
            <div style={css("display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:340px")}>
              <div style={css("font-size:10.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
                {leadsWorked} brands · {monthLabel}
              </div>
              <div style={css("display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#FBBF24" style={{ flex: "none" }} aria-hidden="true">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                </svg>
                {hubWorking} working · {tasksRunning} tasks
              </div>
              {typeof ws.pitchesDrafted === "number" && (
                <div style={css("font-size:10.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
                  {ws.pitchesDrafted} pitches
                </div>
              )}
              {typeof ws.callsBooked === "number" && (
                <div style={css("font-size:10.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
                  {ws.callsBooked} calls booked
                </div>
              )}
            </div>
          </div>

          {/* agent nodes */}
          {nodes.map((n) => (
            <div
              key={n.a.id}
              aria-label={n.a.name}
              style={css(
                "position:absolute;left:" + n.x + "px;top:" + n.y + "px;transform:translate(-50%,-50%);width:170px;display:flex;flex-direction:column;align-items:center;z-index:2"
              )}
            >
              <div
                style={css(
                  "display:flex;flex-direction:column;align-items:center;gap:6px;animation:floaty " +
                    (5 + (n.i % 3)) +
                    "s ease-in-out " +
                    (n.i * 0.45).toFixed(2) +
                    "s infinite"
                )}
              >
                <div style={css("position:relative")}>
                  <div style={css("padding:3px;border-radius:50%;background:#fff;box-shadow:0 0 22px " + n.a.color + "66")}>
                    <div style={css(av(n.a, 46) + ";border:2px solid #250835")}>{n.a.initials}</div>
                  </div>
                  <div
                    style={css(
                      "position:absolute;top:-8px;right:-10px;width:22px;height:22px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(37,8,53,.35);animation:" +
                        n.ic[0]
                    )}
                  >
                    <span style={css(hubIcon(n.type, n.ic[1]))} />
                  </div>
                </div>
                <div style={css("display:flex;align-items:center;gap:5px;margin-top:2px")}>
                  <span
                    style={css(
                      "width:7px;height:7px;border-radius:50%;background:" +
                        n.m.dot +
                        ";flex:none;" +
                        (n.liveWorking ? "animation:pulse 2s infinite" : "")
                    )}
                  />
                  <span style={css("font-size:12px;font-weight:700;color:#fff")}>{n.a.name}</span>
                </div>
                <div style={css("width:60px;height:3px;border-radius:2px;background:rgba(255,255,255,.28);overflow:hidden")}>
                  <div
                    style={css(
                      "width:" +
                        Math.round(((paMap.get(n.a.id)?.leadsWorked ?? 0) / maxOut) * 100) +
                        "%;height:100%;border-radius:2px;background:linear-gradient(90deg," +
                        n.a.color +
                        ",#ab2fed)"
                    )}
                  />
                </div>
                <div
                  style={css(
                    "display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#fff;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(6px);border-radius:99px;padding:4px 10px;white-space:nowrap;max-width:168px;overflow:hidden;text-overflow:ellipsis;animation:" +
                      (tick % 2 ? "badgePopA" : "badgePopB") +
                      " .4s ease"
                  )}
                >
                  <span>{n.badge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* floating particles */}
        <div style={css("position:absolute;left:18%;bottom:30%;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.7);animation:rise 7s ease-in-out infinite")} />
        <div style={css("position:absolute;left:72%;bottom:24%;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.5);animation:rise 9s ease-in-out 2s infinite")} />
        <div style={css("position:absolute;left:48%;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(244,63,126,.6);animation:rise 8s ease-in-out 4s infinite")} />
        <div style={css("position:absolute;left:85%;bottom:55%;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.6);animation:rise 10s ease-in-out 1s infinite")} />

        {/* live activity labels */}
        <div style={css("position:absolute;bottom:16px;left:20px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:3;max-width:70%")}>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.8")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" style={{ flex: "none" }} aria-hidden="true">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
            </svg>
            {hubLive2}
          </div>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:#fff;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" style={{ flex: "none" }} aria-hidden="true">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
            </svg>
            {hubLive}
          </div>
        </div>
      </div>
    </div>
  );
}
