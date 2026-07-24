-- Media Kit: the creator's own profile that agents ground their work in.
-- One row per Clerk account (clerk_user_id is the account's persistent identity).
create table if not exists media_kits (
  id bigserial primary key,
  clerk_user_id text not null unique,
  niche text not null default '',
  audience text not null default '',
  platforms text not null default '',
  rate_floor text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
