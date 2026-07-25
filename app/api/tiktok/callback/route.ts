import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, fetchTikTokUserInfo, saveTikTokConnection, TIKTOK_STATE_COOKIE } from "@/lib/tiktok";

export async function GET(req: Request) {
  const { userId } = await auth();
  const url = new URL(req.url);
  const redirectTo = (status: string) => NextResponse.redirect(new URL(`/media-kit?tiktok=${status}`, url));

  if (!userId) return NextResponse.redirect(new URL("/", url));

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error")) return redirectTo("denied");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(TIKTOK_STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState) return redirectTo("error");

  const token = await exchangeCodeForToken(code);
  if (!token.access_token) return redirectTo("error");

  const info = await fetchTikTokUserInfo(token.access_token);
  await saveTikTokConnection(userId, token, info);

  const res = redirectTo("connected");
  res.cookies.delete(TIKTOK_STATE_COOKIE);
  return res;
}
