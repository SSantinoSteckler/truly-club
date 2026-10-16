-- Keep room secrets organizer-only; attendees use deliberately narrow RPCs.
drop policy if exists "rooms scoped read" on public.rooms;
create policy "rooms organization read" on public.rooms for select to authenticated
using (public.is_organization_member(organization_id));

-- Likes reveal an actor profile only while both people are actively sharing the room.
create or replace function public.get_received_likes(target_room_id uuid)
returns table (like_id uuid, liked_at timestamptz, user_id uuid, display_name text, avatar_path text)
language sql stable security definer set search_path = '' as $$
  select l.id, l.created_at, p.id, p.display_name, p.avatar_path
  from public.likes l join public.profiles p on p.id = l.from_user_id
  where l.room_id = target_room_id and l.to_user_id = auth.uid()
    and public.users_share_active_room(auth.uid(), l.from_user_id)
    and not public.is_blocked_between(auth.uid(), l.from_user_id)
  order by l.created_at desc;
$$;

-- Blocking immediately hides the actor from the user's notification feed.
create or replace function public.get_my_notifications(target_room_id uuid default null, result_limit integer default 50)
returns table (id uuid, room_id uuid, type public.notification_type, actor_user_id uuid, actor_name text, actor_avatar_path text, read_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.room_id, n.type, n.actor_user_id, p.display_name, p.avatar_path, n.read_at, n.created_at
  from public.notifications n join public.profiles p on p.id = n.actor_user_id
  where n.user_id = auth.uid() and (target_room_id is null or n.room_id = target_room_id)
    and not public.is_blocked_between(auth.uid(), n.actor_user_id)
  order by n.created_at desc limit least(greatest(result_limit, 1), 100);
$$;

