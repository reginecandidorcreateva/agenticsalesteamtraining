import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { ensureDefaultAgents } from "@/lib/aiAgents";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await ensureDefaultAgents(userId);

  const agents = await sql`
    select id, name, kind, instructions, created_at as "createdAt"
    from agents where clerk_user_id = ${userId} order by id
  `;

  const lastRuns = await sql`
    select distinct on (agent_id) agent_id as "agentId", task, output, error, created_at as "createdAt"
    from agent_runs
    where clerk_user_id = ${userId}
    order by agent_id, created_at desc
  `;
  const lastRunByAgent = new Map(lastRuns.map((r) => [r.agentId, r]));

  return NextResponse.json(
    agents.map((a) => ({ ...a, lastRun: lastRunByAgent.get(a.id) ?? null }))
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const kind = String(body.kind ?? "custom").trim() || "custom";
  const instructions = String(body.instructions ?? "").trim();

  if (!name || !instructions) {
    return NextResponse.json({ error: "Name and instructions are required." }, { status: 400 });
  }

  const rows = await sql`
    insert into agents (clerk_user_id, name, kind, instructions)
    values (${userId}, ${name}, ${kind}, ${instructions})
    returning id, name, kind, instructions, created_at as "createdAt"
  `;
  return NextResponse.json({ ...rows[0], lastRun: null });
}
