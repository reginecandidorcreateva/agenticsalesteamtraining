import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await sql`
    select notifications_enabled as "notificationsEnabled"
    from user_settings where clerk_user_id = ${userId}
  `;
  return NextResponse.json(rows[0] ?? { notificationsEnabled: true });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const notificationsEnabled = Boolean(body.notificationsEnabled);

  const rows = await sql`
    insert into user_settings (clerk_user_id, notifications_enabled)
    values (${userId}, ${notificationsEnabled})
    on conflict (clerk_user_id) do update set
      notifications_enabled = excluded.notifications_enabled,
      updated_at = now()
    returning notifications_enabled as "notificationsEnabled"
  `;
  return NextResponse.json(rows[0]);
}
