-- Business analytics expose operational presence only. Likes and matches remain
-- private social interactions and are deliberately omitted from organizer RPCs.
create or replace function public.room_analytics(target_room_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.can_manage_room(target_room_id) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'total_attendees', (select count(*) from public.room_presence where room_id = target_room_id),
    'active_now', (select count(*) from public.room_presence where room_id = target_room_id and active and last_seen_at > now() - interval '90 seconds' and public.is_room_active(target_room_id)),
    'max_concurrent', coalesce((
      with events as (
        select joined_at at, 1 delta from public.room_presence where room_id = target_room_id
        union all
        select coalesce(left_at, last_seen_at + interval '90 seconds'), -1 from public.room_presence where room_id = target_room_id
      ), running as (select sum(delta) over (order by at, delta desc) value from events)
      select max(value) from running
    ), 0),
    'age_distribution', coalesce((
      select jsonb_agg(jsonb_build_object('label', bucket, 'value', amount) order by bucket) from (
        select case when p.age < 21 then '18-20' when p.age < 26 then '21-25' when p.age < 31 then '26-30' when p.age < 41 then '31-40' else '41+' end bucket, count(*) amount
        from public.room_presence rp join public.profiles p on p.id = rp.user_id where rp.room_id = target_room_id and p.age is not null group by 1
      ) ages
    ), '[]'::jsonb),
    'top_interests', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', amount) order by amount desc, label) from (
        select i.label, count(*) amount from public.room_presence rp join public.profile_interests pints on pints.profile_id = rp.user_id join public.interests i on i.id = pints.interest_id where rp.room_id = target_room_id group by i.id, i.label order by amount desc limit 10
      ) ints
    ), '[]'::jsonb),
    'intent_distribution', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'value', amount) order by amount desc) from (
        select pi.label, count(*) amount from public.room_presence rp join public.profiles p on p.id = rp.user_id left join public.profile_intents pi on pi.id = p.intent_id where rp.room_id = target_room_id group by pi.label
      ) intents
    ), '[]'::jsonb),
    'peak_hour', (select to_char(date_trunc('hour', joined_at), 'YYYY-MM-DD HH24:00') from public.room_presence where room_id = target_room_id group by date_trunc('hour', joined_at) order by count(*) desc limit 1)
  ) into result;
  return result;
end;
$$;

create or replace function public.organization_dashboard_metrics(target_organization_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.is_organization_member(target_organization_id) then raise exception 'Not authorized'; end if;
  select jsonb_build_object(
    'active_rooms', count(*) filter (where r.status = 'live' and now() between r.start_at and r.end_at),
    'total_attendees', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id),
    'active_now', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id and rp.active and rp.last_seen_at > now() - interval '90 seconds' and public.is_room_active(rr.id))
  ) into result from public.rooms r where r.organization_id = target_organization_id;
  return result;
end;
$$;
