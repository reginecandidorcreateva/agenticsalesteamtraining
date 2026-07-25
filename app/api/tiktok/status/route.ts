import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTikTokConnection } from "@/lib/tiktok";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const connection = await getTikTokConnection(userId);
  return NextResponse.json({ connected: Boolean(connection), connection });
}
