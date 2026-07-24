import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { bookMeeting } from "@/lib/meetings";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const meetings = await sql`
    select id, brand_id as "brandId", brand_name as "brandName", starts_at as "startsAt", notes, created_at as "createdAt"
    from meetings where clerk_user_id = ${userId} order by starts_at asc
  `;
  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const brandId = body.brandId ? Number(body.brandId) : null;
  const brandName = String(body.brandName ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const startsAt = new Date(String(body.startsAt ?? ""));

  if (!brandName) return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  if (isNaN(startsAt.getTime())) return NextResponse.json({ error: "That date/time isn't valid." }, { status: 400 });

  const result = await bookMeeting(userId, { brandId, brandName, startsAt, notes });
  return NextResponse.json(result);
}
