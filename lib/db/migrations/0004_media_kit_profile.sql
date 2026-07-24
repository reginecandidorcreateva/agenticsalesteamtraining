-- Expand the Media Kit into a full creator profile, and track first-time onboarding.
alter table media_kits add column if not exists tone text not null default '';
alter table media_kits add column if not exists deals_done text not null default '';
alter table media_kits add column if not exists onboarding_completed boolean not null default false;

-- platforms was a single free-text field; move to a list of {platform, followers}.
alter table media_kits alter column platforms drop default;
alter table media_kits
  alter column platforms type jsonb
  using (
    case
      when platforms is null or platforms = '' then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object('platform', platforms, 'followers', ''))
    end
  );
alter table media_kits alter column platforms set default '[]'::jsonb;
