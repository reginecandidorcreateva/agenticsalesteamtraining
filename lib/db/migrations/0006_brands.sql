-- Brand deals pipeline. `status` doubles as both the approval gate
-- ('pending_approval') and the board column once approved.
create table if not exists brands (
  id bigserial primary key,
  clerk_user_id text not null,
  name text not null,
  website text not null default '',
  contact_email text not null default '',
  notes text not null default '',
  status text not null default 'pending_approval',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists brands_clerk_user_id_idx on brands (clerk_user_id);
create index if not exists brands_status_idx on brands (clerk_user_id, status);
