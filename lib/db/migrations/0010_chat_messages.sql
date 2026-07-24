-- Group chat with the AI team. agent_id/agent_name are null for user messages
-- and for system-style hints (e.g. no @mention recognized).
create table if not exists chat_messages (
  id bigserial primary key,
  clerk_user_id text not null,
  role text not null,
  agent_id bigint references agents(id) on delete set null,
  agent_name text,
  content text not null,
  is_error boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_clerk_user_id_idx on chat_messages (clerk_user_id, created_at);
