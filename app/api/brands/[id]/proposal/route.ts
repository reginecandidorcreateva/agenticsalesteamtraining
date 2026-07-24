import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getAgentInstructions, runAgentAction } from "@/lib/aiAgents";
import { getMediaKitContext } from "@/lib/mediaKitContext";
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

  const brandId = Number(params.id);
  const brandRows = await sql`
    select id, name, website, notes, brief, pitch from brands where id = ${brandId} and clerk_user_id = ${userId}
  `;
  const brand = brandRows[0];
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  const { agentId, instructions } = await getAgentInstructions(userId, "proposal");
  const context = await getMediaKitContext(userId);

  const prompt = `Draft a scoped, priced sponsorship proposal for "${brand.name}"${brand.website ? ` (${brand.website})` : ""}.
${brand.brief ? `\nResearch brief on this brand:\n${brand.brief}\n` : ""}${brand.pitch ? `\nThe pitch already sent:\n${brand.pitch}\n` : ""}
Creator's context (use this for scope and pricing — the rate floor is a minimum, not a suggestion):
${context}

Write the proposal now: specific deliverables, timeline, and price. No generic boilerplate.`;

  const { output, error } = await runAgentAction(agentId, instructions, prompt);

  if (agentId) {
    await sql`
      insert into agent_runs (clerk_user_id, agent_id, task, output, error)
      values (${userId}, ${agentId}, ${"Proposal: " + brand.name}, ${output}, ${error})
    `;
  }

  if (error) return NextResponse.json({ error }, { status: 502 });

  const rows = await sql`
    update brands set proposal = ${output}, proposal_updated_at = now()
    where id = ${brandId} and clerk_user_id = ${userId}
    returning id, name, website, contact_email as "contactEmail", notes, status,
      brief, brief_updated_at as "briefUpdatedAt",
      pitch, pitch_updated_at as "pitchUpdatedAt",
      proposal, proposal_updated_at as "proposalUpdatedAt",
      followup, followup_updated_at as "followupUpdatedAt",
      created_at as "createdAt"
  `;
  return NextResponse.json(rows[0]);
}
