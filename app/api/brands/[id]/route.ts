import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { isValidStatus } from "@/lib/brands";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();

  if (body.status !== undefined && !isValidStatus(String(body.status))) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const rows = await sql`
    update brands set
      name = coalesce(${body.name ?? null}, name),
      website = coalesce(${body.website ?? null}, website),
      contact_email = coalesce(${body.contactEmail ?? null}, contact_email),
      notes = coalesce(${body.notes ?? null}, notes),
      status = coalesce(${body.status ?? null}, status),
      updated_at = now()
    where id = ${id} and clerk_user_id = ${userId}
    returning id, name, website, contact_email as "contactEmail", notes, status,
      brief, brief_updated_at as "briefUpdatedAt",
      pitch, pitch_updated_at as "pitchUpdatedAt",
      proposal, proposal_updated_at as "proposalUpdatedAt",
      followup, followup_updated_at as "followupUpdatedAt",
      created_at as "createdAt"
  `;
  if (!rows[0]) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const id = Number(params.id);
  await sql`delete from brands where id = ${id} and clerk_user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
