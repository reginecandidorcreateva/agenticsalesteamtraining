import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { ensureDefaultTeam } from "@/lib/aiAgents";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await ensureDefaultTeam(userId);

  const teams = await sql`
    select id, name, created_at as "createdAt" from teams where clerk_user_id = ${userId} order by id
  `;
  if (teams.length === 0) return NextResponse.json([]);

  const teamIds = teams.map((t) => t.id);
  const members = await sql`
    select ta.team_id as "teamId", a.id, a.name, a.kind
    from team_agents ta
    join agents a on a.id = ta.agent_id
    where ta.team_id in ${sql(teamIds)}
    order by a.id
  `;
  const membersByTeam = new Map<number, { id: number; name: string; kind: string }[]>();
  for (const m of members) {
    const list = membersByTeam.get(m.teamId) ?? [];
    list.push({ id: m.id, name: m.name, kind: m.kind });
    membersByTeam.set(m.teamId, list);
  }

  return NextResponse.json(
    teams.map((t) => ({ ...t, members: membersByTeam.get(t.id) ?? [] }))
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const agentIds: number[] = Array.isArray(body.agentIds) ? body.agentIds.map(Number).filter(Number.isFinite) : [];

  if (!name) return NextResponse.json({ error: "Team name is required." }, { status: 400 });

  const teamRows = await sql`
    insert into teams (clerk_user_id, name) values (${userId}, ${name}) returning id, name, created_at as "createdAt"
  `;
  const team = teamRows[0];

  if (agentIds.length > 0) {
    const ownedAgents = await sql`
      select id from agents where clerk_user_id = ${userId} and id in ${sql(agentIds)}
    `;
    for (const a of ownedAgents) {
      await sql`insert into team_agents (team_id, agent_id) values (${team.id}, ${a.id})`;
    }
  }

  const members = await sql`
    select a.id, a.name, a.kind from team_agents ta
    join agents a on a.id = ta.agent_id
    where ta.team_id = ${team.id}
    order by a.id
  `;

  return NextResponse.json({ ...team, members });
}
