import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { generateText } from "@/lib/ai";
import { searchWeb } from "@/lib/webSearch";
import { getAgentInstructions } from "@/lib/aiAgents";
import { getMediaKitContext } from "@/lib/mediaKitContext";
import { PENDING_APPROVAL } from "@/lib/brands";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const kitRows = await sql`select niche, audience from media_kits where clerk_user_id = ${userId}`;
  const kit = kitRows[0];
  if (!kit?.niche) {
    return NextResponse.json(
      { error: "Fill in your niche in your Media Kit first — that's what brand discovery searches for." },
      { status: 400 }
    );
  }

  let results;
  try {
    results = await searchWeb(`brands and companies that sponsor or partner with ${kit.niche} content creators`, 8);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Web search failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "No search results came back — try again in a bit." }, { status: 502 });
  }

  const { agentId, instructions } = await getAgentInstructions(userId, "research");
  const context = await getMediaKitContext(userId);
  const resultsText = results.map((r, i) => `${i + 1}. ${r.title}\n${r.url}\n${r.description}`).join("\n\n");

  const prompt = `Below are real web search results about brands/companies that sponsor or partner with creators in this space.

Search results:
${resultsText}

Creator's context:
${context}

From these search results only, identify up to 5 distinct REAL brand or company names (not articles, not listicles, not generic sites like YouTube or TikTok themselves). Only include a brand if its actual name appears in the results above — do not invent brands or guess ones not shown here.

Output exactly one line per brand, in this exact format and nothing else, no numbering, no extra commentary:
Brand Name | website.com | one-sentence reason this brand fits this creator

If you can't find at least 2 genuine, distinct brand names in the results, output fewer lines rather than inventing any.`;

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
      values (${userId}, ${agentId}, ${"Discover brands for niche: " + kit.niche}, ${output}, ${error})
    `;
  }

  if (error) return NextResponse.json({ error }, { status: 502 });

  const lines = (output ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));

  const candidates = lines
    .map((line) => {
      const [name, website, ...reasonParts] = line.split("|").map((p) => p.trim());
      return { name, website: website ?? "", reason: reasonParts.join("|").trim() };
    })
    .filter((b) => b.name);

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find any clear brand matches in this search — try again, or add brands yourself." },
      { status: 502 }
    );
  }

  const created = [];
  for (const b of candidates) {
    const rows = await sql`
      insert into brands (clerk_user_id, name, website, notes, status)
      values (${userId}, ${b.name}, ${b.website}, ${b.reason}, ${PENDING_APPROVAL})
      returning id, name, website, contact_email as "contactEmail", notes, status,
        brief, brief_updated_at as "briefUpdatedAt",
        pitch, pitch_updated_at as "pitchUpdatedAt",
        proposal, proposal_updated_at as "proposalUpdatedAt",
        followup, followup_updated_at as "followupUpdatedAt",
        created_at as "createdAt"
    `;
    created.push(rows[0]);
  }

  return NextResponse.json(created);
}
