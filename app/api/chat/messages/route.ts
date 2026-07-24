import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { runAgentAction } from "@/lib/aiAgents";
import { getMediaKitContext } from "@/lib/mediaKitContext";
import { discoverBrandsForTopic } from "@/lib/brandDiscovery";
import { parseAndBookFromText } from "@/lib/meetings";
import { checkAiRateLimit } from "@/lib/rateLimit";

interface AgentRow {
  id: number;
  name: string;
  kind: string;
  instructions: string;
}

function matchMention(content: string, agents: AgentRow[]): { agent: AgentRow; task: string } | null {
  if (!content.includes("@")) return null;
  const lower = content.toLowerCase();
  const sorted = [...agents].sort((a, b) => b.name.length - a.name.length);

  for (const agent of sorted) {
    const needle = "@" + agent.name.toLowerCase();
    const idx = lower.indexOf(needle);
    if (idx !== -1) {
      const task = content
        .slice(idx + needle.length)
        .trim()
        .replace(/^[,:\-–]\s*/, "");
      return { agent, task };
    }
  }
  return null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const messages = await sql`
    select id, role, agent_id as "agentId", agent_name as "agentName", content, is_error as "isError", created_at as "createdAt"
    from chat_messages where clerk_user_id = ${userId} order by created_at asc
  `;
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });

  const userMsgRows = await sql`
    insert into chat_messages (clerk_user_id, role, content)
    values (${userId}, 'user', ${content})
    returning id, role, agent_id as "agentId", agent_name as "agentName", content, is_error as "isError", created_at as "createdAt"
  `;

  const agents = await sql<AgentRow[]>`
    select id, name, kind, instructions from agents where clerk_user_id = ${userId}
  `;
  const match = matchMention(content, agents);

  let replyContent: string;
  let replyAgentId: number | null = null;
  let replyAgentName: string | null = null;
  let isError = false;

  if (!match) {
    replyContent =
      agents.length > 0
        ? `Mention a helper so they know who's being asked — try ${agents
            .slice(0, 3)
            .map((a) => "@" + a.name)
            .join(", ")}.`
        : "You don't have any helpers yet — add one on the Agents page first.";
  } else {
    const { agent, task } = match;
    replyAgentId = agent.id;
    replyAgentName = agent.name;

    const rl = task ? checkAiRateLimit(userId) : { allowed: true, retryAfterSeconds: 0 };

    if (!task) {
      replyContent = "What would you like me to do?";
    } else if (!rl.allowed) {
      replyContent = `Too many requests to your AI helpers — try again in ${rl.retryAfterSeconds}s.`;
      isError = true;
    } else if (agent.kind === "research") {
      const result = await discoverBrandsForTopic(userId, task);
      if ("error" in result) {
        replyContent = result.error;
        isError = true;
      } else {
        const names = result.created.map((b) => b.name).join(", ");
        replyContent = `Found ${result.created.length} real brand${result.created.length === 1 ? "" : "s"} for "${task}": ${names}. Added to your Needs your approval queue on Brand Deals.`;
      }
    } else if (agent.kind === "scheduler") {
      const result = await parseAndBookFromText(userId, task);
      if ("error" in result) {
        replyContent = result.error;
        isError = true;
      } else {
        const when = new Date(result.meeting.startsAt).toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        replyContent = `Booked a call with ${result.meeting.brandName} for ${when}. It's on your Calendar${
          result.brand ? ` and I moved ${result.brand.name} to "Booked a Call."` : "."
        }`;
      }
    } else {
      const context = await getMediaKitContext(userId);
      const prompt = `${context}\n\nTask: ${task}`;
      const { output, error } = await runAgentAction(agent.id, agent.instructions, prompt);
      replyContent = error ?? output ?? "";
      isError = Boolean(error);
      await sql`
        insert into agent_runs (clerk_user_id, agent_id, task, output, error)
        values (${userId}, ${agent.id}, ${task}, ${output}, ${error})
      `;
    }
  }

  const agentMsgRows = await sql`
    insert into chat_messages (clerk_user_id, role, agent_id, agent_name, content, is_error)
    values (${userId}, 'agent', ${replyAgentId}, ${replyAgentName}, ${replyContent}, ${isError})
    returning id, role, agent_id as "agentId", agent_name as "agentName", content, is_error as "isError", created_at as "createdAt"
  `;

  return NextResponse.json({ userMessage: userMsgRows[0], agentMessage: agentMsgRows[0] });
}
