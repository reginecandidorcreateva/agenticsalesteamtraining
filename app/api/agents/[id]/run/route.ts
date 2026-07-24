import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { generateText } from "@/lib/ai";
import { getMediaKitContext } from "@/lib/mediaKitContext";
import { withAgentWorking } from "@/lib/aiAgents";
import { checkAiRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rl = checkAiRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests to your AI helpers — try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const agentId = Number(params.id);
  const body = await req.json();
  const task = String(body.task ?? "").trim();
  if (!task) return NextResponse.json({ error: "Tell the helper what to do." }, { status: 400 });

  const agentRows = await sql`
    select id, name, instructions from agents where id = ${agentId} and clerk_user_id = ${userId}
  `;
  const agent = agentRows[0];
  if (!agent) return NextResponse.json({ error: "Helper not found." }, { status: 404 });

  const context = await getMediaKitContext(userId);
  const prompt = `${context}\n\nTask: ${task}`;

  let output: string | null = null;
  let error: string | null = null;
  try {
    output = await withAgentWorking(agentId, () => generateText(agent.instructions, prompt));
  } catch (err) {
    error = err instanceof Error ? err.message : "Something went wrong talking to the AI.";
  }

  const runRows = await sql`
    insert into agent_runs (clerk_user_id, agent_id, task, output, error)
    values (${userId}, ${agentId}, ${task}, ${output}, ${error})
    returning task, output, error, created_at as "createdAt"
  `;

  if (error) return NextResponse.json(runRows[0], { status: 502 });
  return NextResponse.json(runRows[0]);
}
