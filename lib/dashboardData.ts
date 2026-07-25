import { sql } from "@/lib/db";
import { ensureDefaultTeam } from "@/lib/aiAgents";
import type { AgentType, TeamTemplate } from "@/lib/agentTypes";
import type { WorkspaceStats, ActivityItem } from "@/lib/workspace/stats";

const KIND_COLOR: Record<string, string> = {
  research: "#0EA5E9",
  outreach: "#5122C1",
  proposal: "#7C3AED",
  followup: "#8B5CF6",
  scheduler: "#F43F7E",
};
const CUSTOM_COLORS = ["#ab2fed", "#0283ec", "#2FA45C", "#F59E0B", "#4b38ee"];

const KIND_CAPABILITY: Record<string, string> = {
  research: "research",
  outreach: "outreach",
  proposal: "proposal",
  followup: "follow-up",
  scheduler: "book-meeting",
};

const KIND_LABEL: Record<string, string> = {
  research: "Research",
  outreach: "Initial Outreach",
  proposal: "Proposal",
  followup: "Follow-up",
  scheduler: "Scheduler",
  custom: "Custom",
};

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export interface DashboardData {
  agents: AgentType[];
  teams: TeamTemplate[];
  stats: WorkspaceStats;
  activity: ActivityItem[];
  avatarUrl: string | null;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  await ensureDefaultTeam(userId);

  // Genuine status per agent: currently working (live) > last run failed (error) >
  // has done real work before (waiting, idle) > never run (offline).
  const agentRows = await sql`
    select a.id, a.name, a.kind, a.is_working as "isWorking", lr.error as "lastError", lr."createdAt" as "lastRunAt"
    from agents a
    left join lateral (
      select error, created_at as "createdAt" from agent_runs where agent_id = a.id order by created_at desc limit 1
    ) lr on true
    where a.clerk_user_id = ${userId}
    order by a.id
  `;

  const agents: AgentType[] = agentRows.map((row, i) => ({
    id: String(row.id),
    name: row.name,
    initials: initialsFor(row.name),
    role: KIND_LABEL[row.kind] ?? "Custom",
    color: KIND_COLOR[row.kind] ?? CUSTOM_COLORS[i % CUSTOM_COLORS.length],
    capabilities: KIND_CAPABILITY[row.kind] ? [KIND_CAPABILITY[row.kind]] : [],
    status: row.isWorking ? "working" : row.lastError ? "error" : row.lastRunAt ? "waiting" : "offline",
    task: "",
    goal: "",
  }));

  const teamRows = await sql`
    select id, name from teams where clerk_user_id = ${userId} order by id
  `;
  let teams: TeamTemplate[] = [];
  if (teamRows.length > 0) {
    const teamIds = teamRows.map((t) => t.id);
    const memberRows = await sql`
      select team_id as "teamId", agent_id as "agentId" from team_agents where team_id in ${sql(teamIds)}
    `;
    const membersByTeam = new Map<string, string[]>();
    for (const m of memberRows) {
      const key = String(m.teamId);
      const list = membersByTeam.get(key) ?? [];
      list.push(String(m.agentId));
      membersByTeam.set(key, list);
    }
    teams = teamRows.map((t) => ({
      id: String(t.id),
      name: t.name,
      description: "",
      members: membersByTeam.get(String(t.id)) ?? [],
    }));
  }

  const [leadsWorkedRows, tasksRunningRows, perAgentRows, activityRows, pitchesRows, callsRows, tiktokRows] = await Promise.all([
    sql`
      select count(*)::int as c from brands
      where clerk_user_id = ${userId}
        and (created_at >= date_trunc('month', now()) or updated_at >= date_trunc('month', now()))
    `,
    sql`
      select count(*)::int as c from brands
      where clerk_user_id = ${userId} and status in ('new', 'pitched', 'proposal_sent', 'following_up')
    `,
    sql`
      select agent_id as "agentId", count(*)::int as c from agent_runs
      where clerk_user_id = ${userId} and created_at >= date_trunc('month', now())
      group by agent_id
    `,
    sql`
      select agent_id as "agentId", task from agent_runs
      where clerk_user_id = ${userId}
      order by created_at desc
      limit 10
    `,
    sql`
      select count(*)::int as c from agent_runs ar
      join agents a on a.id = ar.agent_id
      where ar.clerk_user_id = ${userId} and a.kind = 'outreach' and ar.error is null
        and ar.created_at >= date_trunc('month', now())
    `,
    sql`
      select count(*)::int as c from meetings
      where clerk_user_id = ${userId} and created_at >= date_trunc('month', now())
    `,
    sql`
      select avatar_url as "avatarUrl" from tiktok_connections where clerk_user_id = ${userId}
    `,
  ]);

  const stats: WorkspaceStats = {
    activeAgents: agents.filter((a) => a.status === "working").length,
    tasksRunning: tasksRunningRows[0]?.c ?? 0,
    leadsWorked: leadsWorkedRows[0]?.c ?? 0,
    perAgent: perAgentRows.map((r) => ({ agentId: String(r.agentId), leadsWorked: r.c })),
    pitchesDrafted: pitchesRows[0]?.c ?? 0,
    callsBooked: callsRows[0]?.c ?? 0,
  };

  const activity: ActivityItem[] = activityRows.map((r) => ({
    agentId: String(r.agentId),
    text: r.task,
  }));

  const avatarUrl: string | null = tiktokRows[0]?.avatarUrl ?? null;

  return { agents, teams, stats, activity, avatarUrl };
}
