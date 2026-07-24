import { sql } from "@/lib/db";
import { generateText } from "@/lib/ai";

export interface DefaultAgent {
  name: string;
  kind: string;
  instructions: string;
}

export const DEFAULT_AGENTS: DefaultAgent[] = [
  {
    name: "Research",
    kind: "research",
    instructions:
      "You are a Research agent for a content creator's brand-deal outreach. Given the creator's media kit and a target brand or niche, identify why the brand could be a good sponsorship fit, and summarize the key facts a pitch should reference. Be specific and concise.",
  },
  {
    name: "Outreach",
    kind: "outreach",
    instructions:
      "You are an Outreach agent. Write a short, warm, personalized first-touch pitch (email or DM) from the creator to a brand, written in the creator's own tone, referencing their niche, audience, and value. Keep it under 150 words and end with a clear, low-pressure ask.",
  },
  {
    name: "Proposal",
    kind: "proposal",
    instructions:
      "You are a Proposal agent. Draft a scoped, priced sponsorship proposal for the creator, grounded in their media kit (niche, audience, platforms, rate floor). Include deliverables, timeline, and price. Keep it specific, not generic boilerplate.",
  },
  {
    name: "Follow-up",
    kind: "followup",
    instructions:
      "You are a Follow-up agent. Write a short, polite, low-pressure follow-up message to a brand that has gone quiet after a pitch or proposal. Reference what was previously sent without repeating it in full.",
  },
  {
    name: "Scheduler",
    kind: "scheduler",
    instructions:
      "You are a Scheduling agent. Given a plain-English request like 'book a call with Acme next Tuesday at 2pm', respond confirming the meeting details clearly and suggest a short agenda. Note: this does not yet connect to a real calendar.",
  },
];

export async function getAgentInstructions(
  userId: string,
  kind: string
): Promise<{ agentId: number | null; instructions: string }> {
  const rows = await sql`
    select id, instructions from agents where clerk_user_id = ${userId} and kind = ${kind} limit 1
  `;
  if (rows[0]) return { agentId: rows[0].id, instructions: rows[0].instructions };
  const fallback = DEFAULT_AGENTS.find((a) => a.kind === kind);
  return { agentId: null, instructions: fallback?.instructions ?? "" };
}

// Flips a real "is this agent working right now" flag around a real action,
// so the dashboard can pulse an agent only while it's genuinely in flight —
// not just because it has run at some point in the past.
export async function withAgentWorking<T>(agentId: number | null, fn: () => Promise<T>): Promise<T> {
  if (!agentId) return fn();
  await sql`update agents set is_working = true, working_started_at = now() where id = ${agentId}`;
  try {
    return await fn();
  } finally {
    await sql`update agents set is_working = false where id = ${agentId}`;
  }
}

export async function runAgentAction(
  agentId: number | null,
  instructions: string,
  prompt: string
): Promise<{ output: string | null; error: string | null }> {
  let output: string | null = null;
  let error: string | null = null;
  try {
    output = await withAgentWorking(agentId, () => generateText(instructions, prompt));
  } catch (err) {
    error = err instanceof Error ? err.message : "Something went wrong talking to the AI.";
  }
  return { output, error };
}

export async function ensureDefaultAgents(userId: string) {
  const existing = await sql`select count(*)::int as count from agents where clerk_user_id = ${userId}`;
  if (existing[0].count > 0) return;
  for (const a of DEFAULT_AGENTS) {
    await sql`
      insert into agents (clerk_user_id, name, kind, instructions)
      values (${userId}, ${a.name}, ${a.kind}, ${a.instructions})
    `;
  }
}

export async function ensureDefaultTeam(userId: string) {
  const existingTeams = await sql`select count(*)::int as count from teams where clerk_user_id = ${userId}`;
  if (existingTeams[0].count > 0) return;

  await ensureDefaultAgents(userId);
  const agentRows = await sql`select id from agents where clerk_user_id = ${userId} order by id`;

  const teamRows = await sql`
    insert into teams (clerk_user_id, name) values (${userId}, 'Deal Team') returning id
  `;
  const teamId = teamRows[0].id;
  for (const a of agentRows) {
    await sql`insert into team_agents (team_id, agent_id) values (${teamId}, ${a.id})`;
  }
}
