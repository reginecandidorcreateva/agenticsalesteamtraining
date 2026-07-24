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
    select id, name, pitch, proposal from brands where id = ${brandId} and clerk_user_id = ${userId}
  `;
  const brand = brandRows[0];
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  const priorContact = brand.proposal || brand.pitch;
  if (!priorContact) {
    return NextResponse.json(
      { error: "Send a pitch or proposal to this brand first — Follow-up needs something to build on." },
      { status: 400 }
    );
  }

  const { agentId, instructions } = await getAgentInstructions(userId, "followup");
  const context = await getMediaKitContext(userId);

  const prompt = `Write a short, friendly follow-up nudge to "${brand.name}" — they've gone quiet since we last reached out.

What was already sent (build on this, don't repeat it in full):
${priorContact}

Creator's context:
${context}

Write the follow-up now: short, warm, low-pressure, referencing the above without restating it all.`;

  const { output, error } = await runAgentAction(agentId, instructions, prompt);

  if (agentId) {
    await sql`
      insert into agent_runs (clerk_user_id, agent_id, task, output, error)
      values (${userId}, ${agentId}, ${"Follow-up: " + brand.name}, ${output}, ${error})
    `;
  }

  if (error) return NextResponse.json({ error }, { status: 502 });

  const rows = await sql`
    update brands set followup = ${output}, followup_updated_at = now()
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
