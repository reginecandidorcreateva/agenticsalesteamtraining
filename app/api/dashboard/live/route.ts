import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await sql`
    select id from agents where clerk_user_id = ${userId} and is_working = true
  `;
  return NextResponse.json({ workingAgentIds: rows.map((r) => String(r.id)) });
}
