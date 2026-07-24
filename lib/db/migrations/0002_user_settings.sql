-- Per-account app preferences. One row per Clerk account.
create table if not exists user_settings (
  id bigserial primary key,
  clerk_user_id text not null unique,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
