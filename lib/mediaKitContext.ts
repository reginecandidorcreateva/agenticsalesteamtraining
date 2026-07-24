import { sql } from "@/lib/db";

interface PlatformEntry {
  platform: string;
  followers: string;
}

export async function getMediaKitContext(userId: string): Promise<string> {
  const rows = await sql`
    select niche, audience, platforms, tone, rate_floor as "rateFloor"
    from media_kits where clerk_user_id = ${userId}
  `;
  const kit = rows[0];
  if (!kit) return "No media kit on file yet.";

  const platformList: PlatformEntry[] = Array.isArray(kit.platforms) ? kit.platforms : [];
  const platforms = platformList.length
    ? platformList.map((p) => `${p.platform}${p.followers ? ` (${p.followers})` : ""}`).join(", ")
    : "(not set)";

  return `Creator's niche: ${kit.niche || "(not set)"}
Audience: ${kit.audience || "(not set)"}
Platforms: ${platforms}
Tone/voice: ${kit.tone || "(not set)"}
Rate floor: ${kit.rateFloor || "(not set)"}`;
}
