import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { discoverBrandsForTopic } from "@/lib/brandDiscovery";
import { checkAiRateLimit } from "@/lib/rateLimit";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rl = checkAiRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests to your AI helpers — try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const kitRows = await sql`select niche from media_kits where clerk_user_id = ${userId}`;
  const kit = kitRows[0];
  if (!kit?.niche) {
    return NextResponse.json(
      { error: "Fill in your niche in your Media Kit first — that's what brand discovery searches for." },
      { status: 400 }
    );
  }

  const result = await discoverBrandsForTopic(userId, kit.niche);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json(result.created);
}
