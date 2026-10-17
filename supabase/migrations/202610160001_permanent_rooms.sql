-- Rooms belong to places and remain available until manually paused or deleted.
-- Existing rooms keep their IDs, slugs, QR codes and interaction history.
alter table public.rooms alter column start_at drop not null;
alter table public.rooms alter column end_at drop not null;
alter table public.rooms drop constraint rooms_valid_dates;

create or replace function public.deactivate_room_presence()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'live' and old.status is distinct from new.status then
    update public.room_presence set active = false, left_at = coalesce(left_at, now())
    where room_id = new.id and active;
  end if;
  return new;
end;
$$;

-- Keep effectively open rooms open; unopened, expired and cancelled rooms become
-- paused, so this migration never opens a previously unavailable room.
update public.rooms
set status = case
    when status in ('scheduled', 'live') and now() >= start_at and now() < end_at then 'live'::public.room_status
    when status = 'live' and start_at is null and end_at is null then 'live'::public.room_status
    else 'draft'::public.room_status
  end,
  start_at = null,
  end_at = null;

alter table public.rooms add constraint rooms_permanent_dates check (start_at is null and end_at is null);
alter table public.rooms add constraint rooms_manual_status check (status in ('draft', 'live'));

update public.room_presence rp
set active = false, left_at = coalesce(rp.left_at, now())
where rp.active and exists (select 1 from public.rooms r where r.id = rp.room_id and r.status <> 'live');

create or replace function public.is_room_active(target_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rooms r where r.id = target_room_id and r.status = 'live');
$$;

-- Paused rooms still resolve at their permanent URL, but joining is forbidden.
create or replace function public.get_public_room(room_slug text)
returns table (
  id uuid, name text, slug text, description text,
  start_at timestamptz, end_at timestamptz, status public.room_status,
  venue_name text, venue_city text
)
language sql stable security definer set search_path = '' as $$
  select r.id, r.name, r.slug, r.description, r.start_at, r.end_at, r.status, v.name, v.city
  from public.rooms r left join public.venues v on v.id = r.venue_id
  where r.slug = room_slug limit 1;
$$;

create or replace function public.join_room(target_room_id uuid)
returns public.room_presence language plpgsql security definer set search_path = '' as $$
declare result public.room_presence;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  -- Serialize joining with pause/delete so neither can leave an active presence
  -- behind after the organizer has closed access.
  perform 1 from public.rooms where id = target_room_id for share;
  if not public.is_room_active(target_room_id) then raise exception 'Room is not active'; end if;
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.onboarding_completed) then
    raise exception 'Complete onboarding first';
  end if;
  insert into public.room_presence (room_id, user_id, joined_at, last_seen_at, left_at, active)
  values (target_room_id, auth.uid(), now(), now(), null, true)
  on conflict (room_id, user_id) do update
    set last_seen_at = now(), left_at = null, active = true
  returning * into result;
  return result;
end;
$$;

create or replace function public.heartbeat_presence(target_room_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then return false; end if;
  perform 1 from public.rooms where id = target_room_id for share;
  if not public.is_room_active(target_room_id) then
    update public.room_presence set active = false, left_at = coalesce(left_at, now())
    where room_id = target_room_id and user_id = auth.uid() and active;
    return false;
  end if;
  -- A paused or departed presence must explicitly join again after reopening.
  update public.room_presence set last_seen_at = now()
  where room_id = target_room_id and user_id = auth.uid() and active;
  return found;
end;
$$;

create or replace function public.organization_dashboard_metrics(target_organization_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.is_organization_member(target_organization_id) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'active_rooms', count(*) filter (where r.status = 'live'),
    'total_attendees', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id),
    'active_now', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id and rp.active and rp.last_seen_at > now() - interval '90 seconds' and public.is_room_active(rr.id))
  ) into result from public.rooms r where r.organization_id = target_organization_id;
  return result;
end;
$$;
