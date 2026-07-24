-- A short, AI-generated research brief attached to each brand: what they
-- care about and the best angle to pitch them.
alter table brands add column if not exists brief text not null default '';
alter table brands add column if not exists brief_updated_at timestamptz;
