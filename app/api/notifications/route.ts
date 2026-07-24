import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const settingsRows = await sql`
    select notifications_enabled as "notificationsEnabled", notifications_last_seen_at as "lastSeenAt"
    from user_settings where clerk_user_id = ${userId}
  `;
  const notificationsEnabled = settingsRows[0]?.notificationsEnabled ?? true;
  const lastSeenAt = settingsRows[0]?.lastSeenAt ?? null;

  const items = await sql`
    select ar.id, ar.agent_id as "agentId", a.name as "agentName", ar.task, ar.error is not null as "isError", ar.created_at as "createdAt"
    from agent_runs ar
    join agents a on a.id = ar.agent_id
    where ar.clerk_user_id = ${userId}
    order by ar.created_at desc
    limit 15
  `;

  const unreadCount =
    notificationsEnabled && lastSeenAt
      ? items.filter((i) => new Date(i.createdAt) > new Date(lastSeenAt)).length
      : notificationsEnabled
        ? items.length
        : 0;

  return NextResponse.json({ items, unreadCount });
}
