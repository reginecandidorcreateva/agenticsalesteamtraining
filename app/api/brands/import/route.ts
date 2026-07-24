import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { PENDING_APPROVAL } from "@/lib/brands";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const text = String(body.text ?? "");

  const parsed = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, website] = line.split(",").map((p) => p.trim());
      return { name, website: website ?? "" };
    })
    .filter((b) => b.name);

  if (parsed.length === 0) {
    return NextResponse.json({ error: "Nothing to import — add at least one brand name." }, { status: 400 });
  }

  const created = [];
  for (const b of parsed) {
    const rows = await sql`
      insert into brands (clerk_user_id, name, website, status)
      values (${userId}, ${b.name}, ${b.website}, ${PENDING_APPROVAL})
      returning id, name, website, contact_email as "contactEmail", notes, status,
        brief, brief_updated_at as "briefUpdatedAt",
        pitch, pitch_updated_at as "pitchUpdatedAt",
        proposal, proposal_updated_at as "proposalUpdatedAt",
        followup, followup_updated_at as "followupUpdatedAt",
        created_at as "createdAt"
    `;
    created.push(rows[0]);
  }

  return NextResponse.json(created);
}
