import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const agentIds: number[] = Array.isArray(body.agentIds) ? body.agentIds.map(Number).filter(Number.isFinite) : [];
  if (!name) return NextResponse.json({ error: "Team name is required." }, { status: 400 });

  const teamRows = await sql`
    update teams set name = ${name} where id = ${id} and clerk_user_id = ${userId}
    returning id, name, created_at as "createdAt"
  `;
  const team = teamRows[0];
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  await sql`delete from team_agents where team_id = ${id}`;
  if (agentIds.length > 0) {
    const ownedAgents = await sql`
      select id from agents where clerk_user_id = ${userId} and id in ${sql(agentIds)}
    `;
    for (const a of ownedAgents) {
      await sql`insert into team_agents (team_id, agent_id) values (${id}, ${a.id})`;
    }
  }

  const members = await sql`
    select a.id, a.name, a.kind from team_agents ta
    join agents a on a.id = ta.agent_id
    where ta.team_id = ${id}
    order by a.id
  `;
  return NextResponse.json({ ...team, members });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  await sql`delete from teams where id = ${id} and clerk_user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
