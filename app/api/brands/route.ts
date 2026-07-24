import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { PENDING_APPROVAL } from "@/lib/brands";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const brands = await sql`
    select id, name, website, contact_email as "contactEmail", notes, status,
      brief, brief_updated_at as "briefUpdatedAt",
      pitch, pitch_updated_at as "pitchUpdatedAt",
      proposal, proposal_updated_at as "proposalUpdatedAt",
      followup, followup_updated_at as "followupUpdatedAt",
      created_at as "createdAt"
    from brands where clerk_user_id = ${userId} order by id desc
  `;
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const website = String(body.website ?? "").trim();
  const contactEmail = String(body.contactEmail ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!name) return NextResponse.json({ error: "Brand name is required." }, { status: 400 });

  const rows = await sql`
    insert into brands (clerk_user_id, name, website, contact_email, notes, status)
    values (${userId}, ${name}, ${website}, ${contactEmail}, ${notes}, ${PENDING_APPROVAL})
    returning id, name, website, contact_email as "contactEmail", notes, status,
      brief, brief_updated_at as "briefUpdatedAt",
      pitch, pitch_updated_at as "pitchUpdatedAt",
      proposal, proposal_updated_at as "proposalUpdatedAt",
      followup, followup_updated_at as "followupUpdatedAt",
      created_at as "createdAt"
  `;
  return NextResponse.json(rows[0]);
}
