import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  await sql`delete from meetings where id = ${id} and clerk_user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
