import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseAndBookFromText } from "@/lib/meetings";
import { checkAiRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rl = checkAiRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests to your AI helpers — try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const text = String(body.text ?? "");

  const result = await parseAndBookFromText(userId, text);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
