-- Pitch, proposal, and follow-up text generated per brand, symmetric with brief.
alter table brands add column if not exists pitch text not null default '';
alter table brands add column if not exists pitch_updated_at timestamptz;
alter table brands add column if not exists proposal text not null default '';
alter table brands add column if not exists proposal_updated_at timestamptz;
alter table brands add column if not exists followup text not null default '';
alter table brands add column if not exists followup_updated_at timestamptz;
