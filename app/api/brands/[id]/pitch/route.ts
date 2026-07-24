import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { generateText } from "@/lib/ai";
import { getAgentInstructions } from "@/lib/aiAgents";
import { getMediaKitContext } from "@/lib/mediaKitContext";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const brandId = Number(params.id);
  const brandRows = await sql`
    select id, name, website, notes, brief from brands where id = ${brandId} and clerk_user_id = ${userId}
  `;
  const brand = brandRows[0];
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });

  const { agentId, instructions } = await getAgentInstructions(userId, "outreach");
  const context = await getMediaKitContext(userId);

  const prompt = `Write a first-touch pitch to "${brand.name}"${brand.website ? ` (${brand.website})` : ""}.
${brand.brief ? `\nResearch brief on this brand:\n${brand.brief}\n` : ""}
Creator's context:
${context}

Write the pitch now — an email, personalized, under 150 words, in the creator's tone, ending with a clear, low-pressure ask.`;

  let output: string | null = null;
  let error: string | null = null;
  try {
    output = await generateText(instructions, prompt);
  } catch (err) {
    error = err instanceof Error ? err.message : "Something went wrong talking to the AI.";
  }

  if (agentId) {
    await sql`
      insert into agent_runs (clerk_user_id, agent_id, task, output, error)
      values (${userId}, ${agentId}, ${"Pitch: " + brand.name}, ${output}, ${error})
    `;
  }

  if (error) return NextResponse.json({ error }, { status: 502 });

  const rows = await sql`
    update brands set pitch = ${output}, pitch_updated_at = now()
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
