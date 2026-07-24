import * as chrono from "chrono-node";
import { sql } from "@/lib/db";
import { getAgentInstructions, runAgentAction } from "@/lib/aiAgents";

export async function findBrandByName(userId: string, name: string) {
  const pattern = `%${name.toLowerCase()}%`;
  const rows = await sql`
    select id, name from brands where clerk_user_id = ${userId} and lower(name) like ${pattern} limit 1
  `;
  return rows[0] ?? null;
}

export async function bookMeeting(
  userId: string,
  params: { brandId: number | null; brandName: string; startsAt: Date; notes?: string }
) {
  let brandId = params.brandId;
  if (brandId) {
    const rows = await sql`select id from brands where id = ${brandId} and clerk_user_id = ${userId}`;
    if (!rows[0]) brandId = null;
  }

  const meetingRows = await sql`
    insert into meetings (clerk_user_id, brand_id, brand_name, starts_at, notes)
    values (${userId}, ${brandId}, ${params.brandName}, ${params.startsAt}, ${params.notes ?? ""})
    returning id, brand_id as "brandId", brand_name as "brandName", starts_at as "startsAt", notes, created_at as "createdAt"
  `;

  let brand = null;
  if (brandId) {
    const brandRows = await sql`
      update brands set status = 'booked_call', updated_at = now()
      where id = ${brandId} and clerk_user_id = ${userId}
      returning id, name, website, contact_email as "contactEmail", notes, status,
        brief, brief_updated_at as "briefUpdatedAt",
        pitch, pitch_updated_at as "pitchUpdatedAt",
        proposal, proposal_updated_at as "proposalUpdatedAt",
        followup, followup_updated_at as "followupUpdatedAt",
        created_at as "createdAt"
    `;
    brand = brandRows[0] ?? null;
  }

  return { meeting: meetingRows[0], brand };
}

export async function parseAndBookFromText(userId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { error: 'Tell me who and when — e.g. "book a call with Acme next Tuesday at 2pm".' };
  }

  // Date/time math is unreliable for LLMs even with the reference date given —
  // chrono-node parses it deterministically instead.
  const startsAt = chrono.parseDate(trimmed, new Date());
  if (!startsAt) {
    return { error: 'Couldn\'t figure out a date and time from that — try something like "next Tuesday at 2pm".' };
  }

  const { agentId, instructions } = await getAgentInstructions(userId, "scheduler");
  const prompt = `Extract the brand or company name mentioned in this scheduling request. Reply with just the name, nothing else — no extra words, no punctuation.

Request: "${trimmed}"

If no brand or company name is mentioned, reply exactly: NONE`;

  const { output, error } = await runAgentAction(agentId, instructions, prompt);

  if (agentId) {
    await sql`
      insert into agent_runs (clerk_user_id, agent_id, task, output, error)
      values (${userId}, ${agentId}, ${"Book: " + trimmed}, ${output}, ${error})
    `;
  }

  if (error) return { error };

  const brandNameRaw = (output ?? "").trim();
  if (!brandNameRaw || brandNameRaw.toUpperCase() === "NONE") {
    return { error: "Couldn't figure out who this call is with — try naming the brand more clearly." };
  }

  const matchedBrand = await findBrandByName(userId, brandNameRaw);
  return await bookMeeting(userId, {
    brandId: matchedBrand?.id ?? null,
    brandName: matchedBrand?.name ?? brandNameRaw,
    startsAt,
  });
}
