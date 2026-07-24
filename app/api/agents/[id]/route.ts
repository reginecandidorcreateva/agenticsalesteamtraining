import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const instructions = String(body.instructions ?? "").trim();
  if (!name || !instructions) {
    return NextResponse.json({ error: "Name and instructions are required." }, { status: 400 });
  }

  const rows = await sql`
    update agents set name = ${name}, instructions = ${instructions}, updated_at = now()
    where id = ${id} and clerk_user_id = ${userId}
    returning id, name, kind, instructions, created_at as "createdAt"
  `;
  if (!rows[0]) return NextResponse.json({ error: "Helper not found." }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  await sql`delete from agents where id = ${id} and clerk_user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
