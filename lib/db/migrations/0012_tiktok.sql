-- Stores the real TikTok OAuth connection per user, so we can auto-fill
-- their follower count and profile photo instead of asking them to type it in.
create table if not exists tiktok_connections (
  id bigserial primary key,
  clerk_user_id text not null unique,
  open_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  display_name text,
  avatar_url text,
  follower_count integer,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
