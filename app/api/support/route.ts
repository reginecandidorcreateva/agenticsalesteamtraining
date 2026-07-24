import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`support:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests — try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  await sql`
    insert into support_requests (name, email, message)
    values (${name}, ${email}, ${message})
  `;

  if (process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: "Agentic Sales Team <onboarding@resend.dev>",
        to: process.env.SUPPORT_EMAIL,
        replyTo: email,
        subject: `Support request from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
      if (error) console.error("Failed to send support email:", error);
    } catch (err) {
      console.error("Failed to send support email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
