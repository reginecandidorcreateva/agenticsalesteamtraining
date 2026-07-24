import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await sql`
    insert into user_settings (clerk_user_id, notifications_last_seen_at)
    values (${userId}, now())
    on conflict (clerk_user_id) do update set notifications_last_seen_at = now()
  `;

  return NextResponse.json({ ok: true });
}
