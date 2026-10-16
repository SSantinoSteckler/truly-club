-- Scheduled rooms open automatically at start_at and close at end_at.
-- Security checks use the effective time window even before the stored status is synchronized.

create or replace function public.is_room_active(target_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rooms r
    where r.id = target_room_id
      and r.status in ('scheduled', 'live')
      and now() >= r.start_at
      and now() < r.end_at
  );
$$;

create or replace function public.get_public_room(room_slug text)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  status public.room_status,
  venue_name text,
  venue_city text
)
language sql stable security definer set search_path = '' as $$
  select r.id, r.name, r.slug, r.description, r.start_at, r.end_at,
    case
      when r.status in ('scheduled', 'live') and now() >= r.end_at then 'ended'::public.room_status
      when r.status in ('scheduled', 'live') and now() >= r.start_at and now() < r.end_at then 'live'::public.room_status
      when r.status = 'live' and now() < r.start_at then 'scheduled'::public.room_status
      else r.status
    end,
    v.name,
    v.city
  from public.rooms r
  left join public.venues v on v.id = r.venue_id
  where r.slug = room_slug and r.status <> 'draft'
  limit 1;
$$;

create or replace function public.join_room(target_room_id uuid)
returns public.room_presence language plpgsql security definer set search_path = '' as $$
declare result public.room_presence;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.is_room_active(target_room_id) then raise exception 'Room is not active'; end if;
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.onboarding_completed) then
    raise exception 'Complete onboarding first';
  end if;

  update public.rooms
  set status = 'live'
  where id = target_room_id and status = 'scheduled'
    and now() >= start_at and now() < end_at;

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
  update public.rooms set status = 'ended'
  where id = target_room_id and status in ('scheduled', 'live') and end_at <= now();

  update public.rooms set status = 'live'
  where id = target_room_id and status = 'scheduled'
    and now() >= start_at and now() < end_at;

  if auth.uid() is null or not public.is_room_active(target_room_id) then
    update public.room_presence set active = false, left_at = coalesce(left_at, now())
    where room_id = target_room_id and user_id = auth.uid() and active;
    return false;
  end if;

  update public.room_presence set last_seen_at = now(), active = true, left_at = null
  where room_id = target_room_id and user_id = auth.uid();
  return found;
end;
$$;

create or replace function public.organization_dashboard_metrics(target_organization_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.is_organization_member(target_organization_id) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'active_rooms', count(*) filter (
      where r.status in ('scheduled', 'live') and now() >= r.start_at and now() < r.end_at
    ),
    'upcoming_rooms', count(*) filter (
      where r.status in ('scheduled', 'live') and now() < r.start_at
    ),
    'total_attendees', (
      select count(*) from public.room_presence rp
      join public.rooms rr on rr.id = rp.room_id
      where rr.organization_id = target_organization_id
    ),
    'active_now', (
      select count(*) from public.room_presence rp
      join public.rooms rr on rr.id = rp.room_id
      where rr.organization_id = target_organization_id
        and rp.active
        and rp.last_seen_at > now() - interval '90 seconds'
        and public.is_room_active(rr.id)
    ),
    'likes', (
      select count(*) from public.likes l
      join public.rooms rr on rr.id = l.room_id
      where rr.organization_id = target_organization_id
    ),
    'matches', (
      select count(*) from public.matches m
      join public.rooms rr on rr.id = m.room_id
      where rr.organization_id = target_organization_id
    )
  ) into result
  from public.rooms r
  where r.organization_id = target_organization_id;
  return result;
end;
$$;

-- Bring already-created rooms in line when this migration is first applied.
update public.rooms
set status = 'ended'
where status in ('scheduled', 'live') and end_at <= now();

update public.rooms
set status = 'live'
where status = 'scheduled' and now() >= start_at and now() < end_at;
