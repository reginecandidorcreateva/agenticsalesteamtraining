import { sql } from "@/lib/db";
import { STAGES, PENDING_APPROVAL } from "@/lib/brands";

export interface StageCount {
  key: string;
  label: string;
  count: number;
}

export interface WeekCount {
  weekStart: string;
  count: number;
}

export interface AgentActivity {
  id: string;
  name: string;
  kind: string;
  count: number;
}

export interface AnalyticsData {
  totalBrands: number;
  approvedBrands: number;
  pitchesDrafted: number;
  proposalsSent: number;
  callsBooked: number;
  stageBreakdown: StageCount[];
  dealsClosedByWeek: WeekCount[];
  agentActivity: AgentActivity[];
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  const [
    totalBrandsRows,
    approvedBrandsRows,
    pitchesRows,
    proposalsRows,
    callsRows,
    stageRows,
    weekRows,
    agentActivityRows,
  ] = await Promise.all([
    sql`select count(*)::int as c from brands where clerk_user_id = ${userId}`,
    sql`select count(*)::int as c from brands where clerk_user_id = ${userId} and status != ${PENDING_APPROVAL}`,
    sql`
      select count(*)::int as c from agent_runs ar join agents a on a.id = ar.agent_id
      where ar.clerk_user_id = ${userId} and a.kind = 'outreach' and ar.error is null
        and ar.created_at >= date_trunc('month', now())
    `,
    sql`
      select count(*)::int as c from agent_runs ar join agents a on a.id = ar.agent_id
      where ar.clerk_user_id = ${userId} and a.kind = 'proposal' and ar.error is null
        and ar.created_at >= date_trunc('month', now())
    `,
    sql`
      select count(*)::int as c from meetings
      where clerk_user_id = ${userId} and created_at >= date_trunc('month', now())
    `,
    sql`
      select status, count(*)::int as c from brands where clerk_user_id = ${userId} group by status
    `,
    sql`
      select date_trunc('week', created_at) as "weekStart", count(*)::int as c
      from meetings
      where clerk_user_id = ${userId} and created_at >= now() - interval '8 weeks'
      group by "weekStart"
      order by "weekStart"
    `,
    sql`
      select a.id, a.name, a.kind, count(ar.id)::int as c
      from agents a
      left join agent_runs ar on ar.agent_id = a.id and ar.created_at >= date_trunc('month', now())
      where a.clerk_user_id = ${userId}
      group by a.id, a.name, a.kind
      order by c desc, a.id
    `,
  ]);

  const stageCountByStatus = new Map<string, number>(stageRows.map((r) => [r.status, r.c]));
  const stageBreakdown: StageCount[] = [
    { key: PENDING_APPROVAL, label: "Needs Approval", count: stageCountByStatus.get(PENDING_APPROVAL) ?? 0 },
    ...STAGES.map((s) => ({ key: s.key, label: s.label, count: stageCountByStatus.get(s.key) ?? 0 })),
  ];

  const dealsClosedByWeek: WeekCount[] = weekRows.map((r) => ({
    weekStart: new Date(r.weekStart).toISOString(),
    count: r.c,
  }));

  const agentActivity: AgentActivity[] = agentActivityRows.map((r) => ({
    id: String(r.id),
    name: r.name,
    kind: r.kind,
    count: r.c,
  }));

  return {
    totalBrands: totalBrandsRows[0]?.c ?? 0,
    approvedBrands: approvedBrandsRows[0]?.c ?? 0,
    pitchesDrafted: pitchesRows[0]?.c ?? 0,
    proposalsSent: proposalsRows[0]?.c ?? 0,
    callsBooked: callsRows[0]?.c ?? 0,
    stageBreakdown,
    dealsClosedByWeek,
    agentActivity,
  };
}
