-- Heartbeats run as explicit client mutations. The public room read remains
-- side-effect-free and reports an effective `ended` state via migration 001.
create or replace function public.heartbeat_presence(target_room_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.rooms set status = 'ended'
  where id = target_room_id and status = 'live' and end_at <= now();
  if auth.uid() is null or not public.is_room_active(target_room_id) then
    update public.room_presence set active = false, left_at = coalesce(left_at, now())
    where room_id = target_room_id and active;
    return false;
  end if;
  update public.room_presence set last_seen_at = now(), active = true, left_at = null
  where room_id = target_room_id and user_id = auth.uid();
  return found;
end;
$$;
