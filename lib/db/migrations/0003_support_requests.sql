-- Requests from the public Contact/Support page. Not tied to an account,
-- since people locked out of sign-in aren't authenticated when they send one.
create table if not exists support_requests (
  id bigserial primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
