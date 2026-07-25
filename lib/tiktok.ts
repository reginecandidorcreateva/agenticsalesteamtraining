import { sql } from "@/lib/db";

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

// TikTok requires a fixed, pre-registered HTTPS redirect_uri — must exactly
// match what's configured in the TikTok Developer app's Login Kit settings.
export const TIKTOK_REDIRECT_URI = "https://agenticsalesteamtraining.vercel.app/api/tiktok/callback";
export const TIKTOK_SCOPES = "user.info.basic,user.info.stats";
export const TIKTOK_STATE_COOKIE = "tiktok_oauth_state";

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: "code",
    scope: TIKTOK_SCOPES,
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: TIKTOK_REDIRECT_URI,
    }),
  });
  return res.json();
}

interface TikTokUserInfo {
  open_id: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const fields = "open_id,display_name,avatar_url,follower_count";
  const res = await fetch(`${USER_INFO_URL}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok user info fetch failed:", data.error);
  }
  return data.data?.user ?? {};
}

export async function saveTikTokConnection(userId: string, token: TokenResponse, info: TikTokUserInfo) {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000);
  await sql`
    insert into tiktok_connections (
      clerk_user_id, open_id, access_token, refresh_token, expires_at, display_name, avatar_url, follower_count
    ) values (
      ${userId}, ${token.open_id}, ${token.access_token}, ${token.refresh_token}, ${expiresAt},
      ${info.display_name ?? null}, ${info.avatar_url ?? null}, ${info.follower_count ?? null}
    )
    on conflict (clerk_user_id) do update set
      open_id = excluded.open_id,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      follower_count = excluded.follower_count,
      updated_at = now()
  `;

  if (typeof info.follower_count === "number") {
    await syncFollowerCountToMediaKit(userId, info.follower_count);
  }
}

// Auto-fills (or updates) a "TikTok" row in the Media Kit's platforms list
// with the real follower count, instead of making the user type it in.
async function syncFollowerCountToMediaKit(userId: string, followerCount: number) {
  const rows = await sql`select platforms from media_kits where clerk_user_id = ${userId}`;
  const platforms: { platform: string; followers: string }[] = rows[0]?.platforms ?? [];
  const formatted = followerCount.toLocaleString("en-US");
  const idx = platforms.findIndex((p) => p.platform.trim().toLowerCase() === "tiktok");
  if (idx >= 0) platforms[idx] = { platform: "TikTok", followers: formatted };
  else platforms.push({ platform: "TikTok", followers: formatted });

  await sql`
    insert into media_kits (clerk_user_id, platforms)
    values (${userId}, ${sql.json(platforms as unknown as Record<string, string>)})
    on conflict (clerk_user_id) do update set
      platforms = excluded.platforms,
      updated_at = now()
  `;
}

export interface TikTokConnection {
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  connectedAt: string;
}

export async function getTikTokConnection(userId: string): Promise<TikTokConnection | null> {
  const rows = await sql<TikTokConnection[]>`
    select display_name as "displayName", avatar_url as "avatarUrl",
      follower_count as "followerCount", connected_at as "connectedAt"
    from tiktok_connections where clerk_user_id = ${userId}
  `;
  return rows[0] ?? null;
}
