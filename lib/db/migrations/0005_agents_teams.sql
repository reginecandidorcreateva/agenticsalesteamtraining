-- AI helpers ("agents"), teams of helpers, and a log of what each helper has generated.
create table if not exists agents (
  id bigserial primary key,
  clerk_user_id text not null,
  name text not null,
  kind text not null default 'custom',
  instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agents_clerk_user_id_idx on agents (clerk_user_id);

create table if not exists teams (
  id bigserial primary key,
  clerk_user_id text not null,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists teams_clerk_user_id_idx on teams (clerk_user_id);

create table if not exists team_agents (
  team_id bigint not null references teams(id) on delete cascade,
  agent_id bigint not null references agents(id) on delete cascade,
  primary key (team_id, agent_id)
);

create table if not exists agent_runs (
  id bigserial primary key,
  clerk_user_id text not null,
  agent_id bigint not null references agents(id) on delete cascade,
  task text not null,
  output text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists agent_runs_agent_id_idx on agent_runs (agent_id, created_at desc);
