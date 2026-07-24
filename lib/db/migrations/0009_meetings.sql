-- Booked brand calls. brand_id is nullable since a plain-English booking
-- might not match an existing brand record exactly.
create table if not exists meetings (
  id bigserial primary key,
  clerk_user_id text not null,
  brand_id bigint references brands(id) on delete set null,
  brand_name text not null,
  starts_at timestamptz not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists meetings_clerk_user_id_idx on meetings (clerk_user_id, starts_at);
