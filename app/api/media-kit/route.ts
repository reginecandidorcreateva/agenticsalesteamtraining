import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { EMPTY_MEDIA_KIT, type PlatformEntry } from "@/lib/mediaKit";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await sql`
    select
      niche, audience, platforms, tone,
      deals_done as "dealsDone",
      rate_floor as "rateFloor",
      onboarding_completed as "onboardingCompleted",
      updated_at as "updatedAt"
    from media_kits where clerk_user_id = ${userId}
  `;
  return NextResponse.json(rows[0] ?? EMPTY_MEDIA_KIT);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const niche = String(body.niche ?? "");
  const audience = String(body.audience ?? "");
  const platforms: PlatformEntry[] = Array.isArray(body.platforms)
    ? body.platforms
        .map((p: { platform?: unknown; followers?: unknown }) => ({
          platform: String(p?.platform ?? ""),
          followers: String(p?.followers ?? ""),
        }))
        .filter((p: PlatformEntry) => p.platform.trim() !== "")
    : [];
  const tone = String(body.tone ?? "");
  const dealsDone = String(body.dealsDone ?? "");
  const rateFloor = String(body.rateFloor ?? "");
  const onboardingCompleted = Boolean(body.onboardingCompleted);

  const rows = await sql`
    insert into media_kits (
      clerk_user_id, niche, audience, platforms, tone, deals_done, rate_floor, onboarding_completed
    )
    values (
      ${userId}, ${niche}, ${audience}, ${sql.json(platforms as unknown as Record<string, string>)}, ${tone}, ${dealsDone}, ${rateFloor}, ${onboardingCompleted}
    )
    on conflict (clerk_user_id) do update set
      niche = excluded.niche,
      audience = excluded.audience,
      platforms = excluded.platforms,
      tone = excluded.tone,
      deals_done = excluded.deals_done,
      rate_floor = excluded.rate_floor,
      onboarding_completed = excluded.onboarding_completed,
      updated_at = now()
    returning
      niche, audience, platforms, tone,
      deals_done as "dealsDone",
      rate_floor as "rateFloor",
      onboarding_completed as "onboardingCompleted",
      updated_at as "updatedAt"
  `;
  return NextResponse.json(rows[0]);
}
