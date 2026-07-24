-- Genuine "is this agent working right now" flag, distinct from "has this
-- agent ever run" — used to drive real live pulsing on the dashboard.
alter table agents add column if not exists is_working boolean not null default false;
alter table agents add column if not exists working_started_at timestamptz;

-- Marks when the user last opened the notification bell, to compute unread count.
alter table user_settings add column if not exists notifications_last_seen_at timestamptz;
