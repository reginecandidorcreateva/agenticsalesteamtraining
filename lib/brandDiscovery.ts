import { sql } from "@/lib/db";
import { searchWeb } from "@/lib/webSearch";
import { getAgentInstructions, runAgentAction } from "@/lib/aiAgents";
import { getMediaKitContext } from "@/lib/mediaKitContext";
import { PENDING_APPROVAL } from "@/lib/brands";

export function toSearchSnippet(text: string, maxLen = 150): string {
  const firstSentence = text.split(/[.\n]/)[0].trim();
  const snippet = firstSentence.length > 0 ? firstSentence : text;
  return snippet.length > maxLen ? snippet.slice(0, maxLen).trim() : snippet;
}

export interface DiscoveredBrand {
  id: number;
  name: string;
  website: string;
  [key: string]: unknown;
}

export async function discoverBrandsForTopic(
  userId: string,
  topic: string
): Promise<{ created: DiscoveredBrand[] } | { error: string }> {
  const cleanTopic = toSearchSnippet(topic);
  if (!cleanTopic) return { error: "Tell me what kind of brands to look for." };

  let results;
  try {
    results = await searchWeb(`brands and companies that sponsor or partner with ${cleanTopic} content creators`, 8);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Web search failed." };
  }

  if (results.length === 0) {
    return { error: "No search results came back — try again in a bit." };
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

  const { output, error } = await runAgentAction(agentId, instructions, prompt);

  if (agentId) {
    await sql`
      insert into agent_runs (clerk_user_id, agent_id, task, output, error)
      values (${userId}, ${agentId}, ${"Discover brands for: " + cleanTopic}, ${output}, ${error})
    `;
  }

  if (error) return { error };

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
    return { error: "Couldn't find any clear brand matches in this search — try again, or add brands yourself." };
  }

  const created: DiscoveredBrand[] = [];
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
    created.push(rows[0] as DiscoveredBrand);
  }

  return { created };
}
