-- Truly: complete initial schema. Designed for a fresh Supabase project.
create extension if not exists pgcrypto with schema extensions;

create type public.organization_role as enum ('owner', 'admin', 'staff');
create type public.room_status as enum ('draft', 'scheduled', 'live', 'ended', 'cancelled');
create type public.notification_type as enum ('like', 'match');
create type public.report_status as enum ('pending', 'reviewed', 'dismissed', 'action_taken');

create table public.profile_intents (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_-]+$'),
  label text not null,
  color text not null default '#a78bfa',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9_-]+$'),
  label text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Invitado' check (char_length(display_name) between 1 and 60),
  age smallint check (age between 18 and 99),
  avatar_path text,
  bio text check (char_length(bio) <= 240),
  intent_id uuid references public.profile_intents(id) on delete set null,
  onboarding_completed boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  address text check (char_length(address) <= 180),
  city text not null check (char_length(city) between 2 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text check (char_length(description) <= 600),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.room_status not null default 'draft',
  access_code text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_valid_dates check (end_at > start_at)
);

create table public.room_presence (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  left_at timestamptz,
  active boolean not null default true,
  unique (room_id, user_id)
);

create table public.profile_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, interest_id)
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_not_self check (from_user_id <> to_user_id),
  unique (room_id, from_user_id, to_user_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_one_id uuid not null references auth.users(id) on delete cascade,
  user_two_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint matches_canonical_order check (user_one_id < user_two_id),
  unique (room_id, user_one_id, user_two_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  type public.notification_type not null,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_not_self check (blocker_user_id <> blocked_user_id),
  unique (blocker_user_id, blocked_user_id)
);

create table public.report_reasons (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_-]+$'),
  label text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  reason_id uuid not null references public.report_reasons(id) on delete restrict,
  description text check (char_length(description) <= 1000),
  status public.report_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_not_self check (reporter_user_id <> reported_user_id)
);

-- Required indexes and hot-path compound indexes.
create index room_presence_room_id_idx on public.room_presence(room_id);
create index room_presence_user_id_idx on public.room_presence(user_id);
create index room_presence_active_room_idx on public.room_presence(room_id, active, last_seen_at desc);
create index likes_room_id_idx on public.likes(room_id);
create index likes_from_user_id_idx on public.likes(from_user_id);
create index likes_to_user_id_idx on public.likes(to_user_id);
create index likes_room_to_from_idx on public.likes(room_id, to_user_id, from_user_id);
create index matches_room_id_idx on public.matches(room_id);
create index matches_user_one_idx on public.matches(user_one_id);
create index matches_user_two_idx on public.matches(user_two_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index reports_room_id_idx on public.reports(room_id);
create index reports_room_status_idx on public.reports(room_id, status, created_at desc);
create index rooms_organization_id_idx on public.rooms(organization_id);
create index rooms_status_dates_idx on public.rooms(status, start_at, end_at);
create index venues_organization_id_idx on public.venues(organization_id);
create index organization_members_user_idx on public.organization_members(user_id);
create index profile_interests_interest_idx on public.profile_interests(interest_id);
create index blocks_blocked_idx on public.blocks(blocked_user_id, blocker_user_id);

insert into public.profile_intents (key, label, color, sort_order) values
  ('single', 'Solter@', '#fb7185', 10),
  ('networking', 'Networking', '#60a5fa', 20),
  ('off', 'Solo mirando / OFF', '#94a3b8', 30);

insert into public.interests (slug, label, sort_order) values
  ('musica', 'Música', 10), ('tecnologia', 'Tecnología', 20),
  ('viajes', 'Viajes', 30), ('running', 'Running', 40),
  ('arte', 'Arte', 50), ('negocios', 'Negocios', 60),
  ('startups', 'Startups', 70), ('cine', 'Cine', 80),
  ('deportes', 'Deportes', 90), ('fotografia', 'Fotografía', 100);

insert into public.report_reasons (key, label, sort_order) values
  ('inappropriate', 'Comportamiento inapropiado', 10),
  ('harassment', 'Acoso', 20), ('fake_profile', 'Perfil falso', 30),
  ('offensive_content', 'Contenido ofensivo', 40), ('spam', 'Spam', 50),
  ('other', 'Otro', 60);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger venues_set_updated_at before update on public.venues
for each row execute function public.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), 'Invitado'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_room_active(target_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rooms r
    where r.id = target_room_id and r.status = 'live'
      and now() >= r.start_at and now() < r.end_at
  );
$$;

create or replace function public.is_organization_member(target_organization_id uuid, allowed_roles public.organization_role[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = target_organization_id and om.user_id = auth.uid()
      and (allowed_roles is null or om.role = any(allowed_roles))
  );
$$;

create or replace function public.can_manage_room(target_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rooms r join public.organization_members om on om.organization_id = r.organization_id
    where r.id = target_room_id and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_blocked_between(first_user_id uuid, second_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = first_user_id and b.blocked_user_id = second_user_id)
       or (b.blocker_user_id = second_user_id and b.blocked_user_id = first_user_id)
  );
$$;

create or replace function public.users_share_active_room(viewer_id uuid, target_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.room_presence mine
    join public.room_presence theirs on theirs.room_id = mine.room_id
    where mine.user_id = viewer_id and theirs.user_id = target_user_id
      and mine.active and theirs.active
      and mine.last_seen_at > now() - interval '90 seconds'
      and theirs.last_seen_at > now() - interval '90 seconds'
      and public.is_room_active(mine.room_id)
      and not public.is_blocked_between(viewer_id, target_user_id)
  );
$$;

create or replace function public.can_interact_in_room(target_room_id uuid, target_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_room_active(target_room_id) and exists (
    select 1 from public.room_presence rp
    where rp.room_id = target_room_id and rp.user_id = target_user_id
      and rp.active and rp.last_seen_at > now() - interval '90 seconds'
  );
$$;

create or replace function public.can_view_reported_profile(target_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports rep
    join public.rooms r on r.id = rep.room_id
    join public.organization_members om on om.organization_id = r.organization_id
    where rep.reported_user_id = target_user_id and om.user_id = auth.uid()
  );
$$;

create or replace function public.create_organization(organization_name text, organization_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(organization_name)) < 2 or organization_slug !~ '^[a-z0-9-]+$' then
    raise exception 'Invalid organization';
  end if;
  insert into public.organizations (name, slug, created_by)
  values (trim(organization_name), organization_slug, auth.uid()) returning id into new_id;
  insert into public.organization_members (organization_id, user_id, role)
  values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

create or replace function public.get_public_room(room_slug text)
returns table (id uuid, name text, slug text, description text, start_at timestamptz, end_at timestamptz, status public.room_status, venue_name text, venue_city text)
language sql stable security definer set search_path = '' as $$
  select r.id, r.name, r.slug, r.description, r.start_at, r.end_at,
    case when r.status = 'live' and now() >= r.end_at then 'ended'::public.room_status else r.status end,
    v.name, v.city
  from public.rooms r left join public.venues v on v.id = r.venue_id
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
  insert into public.room_presence (room_id, user_id, joined_at, last_seen_at, left_at, active)
  values (target_room_id, auth.uid(), now(), now(), null, true)
  on conflict (room_id, user_id) do update set last_seen_at = now(), left_at = null, active = true
  returning * into result;
  return result;
end;
$$;

create or replace function public.heartbeat_presence(target_room_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
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

create or replace function public.leave_room(target_room_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.room_presence set active = false, left_at = now()
  where room_id = target_room_id and user_id = auth.uid();
$$;

create or replace function public.discover_room_profiles(target_room_id uuid, page_size integer default 30, page_offset integer default 0)
returns table (id uuid, display_name text, age smallint, avatar_path text, bio text, intent_label text, intent_color text, interests jsonb)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, p.age, p.avatar_path, p.bio, pi.label, pi.color,
    coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'label', i.label) order by i.sort_order)
      from public.profile_interests pints join public.interests i on i.id = pints.interest_id
      where pints.profile_id = p.id and i.active), '[]'::jsonb)
  from public.room_presence rp
  join public.profiles p on p.id = rp.user_id
  left join public.profile_intents pi on pi.id = p.intent_id
  where rp.room_id = target_room_id and rp.user_id <> auth.uid()
    and public.can_interact_in_room(target_room_id, auth.uid())
    and rp.active and rp.last_seen_at > now() - interval '90 seconds'
    and p.onboarding_completed
    and not public.is_blocked_between(auth.uid(), rp.user_id)
  order by rp.last_seen_at desc
  limit least(greatest(page_size, 1), 50) offset greatest(page_offset, 0);
$$;

create or replace function public.get_room_matches(target_room_id uuid)
returns table (match_id uuid, matched_at timestamptz, user_id uuid, display_name text, age smallint, avatar_path text, intent_label text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.created_at, other.id, other.display_name, other.age, other.avatar_path, pi.label
  from public.matches m
  join public.profiles other on other.id = case when m.user_one_id = auth.uid() then m.user_two_id else m.user_one_id end
  left join public.profile_intents pi on pi.id = other.intent_id
  where m.room_id = target_room_id
    and auth.uid() in (m.user_one_id, m.user_two_id)
    and not public.is_blocked_between(m.user_one_id, m.user_two_id)
  order by m.created_at desc;
$$;

create or replace function public.get_received_likes(target_room_id uuid)
returns table (like_id uuid, liked_at timestamptz, user_id uuid, display_name text, avatar_path text)
language sql stable security definer set search_path = '' as $$
  select l.id, l.created_at, p.id, p.display_name, p.avatar_path
  from public.likes l join public.profiles p on p.id = l.from_user_id
  where l.room_id = target_room_id and l.to_user_id = auth.uid()
    and not public.is_blocked_between(auth.uid(), l.from_user_id)
  order by l.created_at desc;
$$;

create or replace function public.get_my_notifications(target_room_id uuid default null, result_limit integer default 50)
returns table (id uuid, room_id uuid, type public.notification_type, actor_user_id uuid, actor_name text, actor_avatar_path text, read_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.room_id, n.type, n.actor_user_id, p.display_name, p.avatar_path, n.read_at, n.created_at
  from public.notifications n join public.profiles p on p.id = n.actor_user_id
  where n.user_id = auth.uid() and (target_room_id is null or n.room_id = target_room_id)
  order by n.created_at desc limit least(greatest(result_limit, 1), 100);
$$;

create or replace function public.handle_like_created()
returns trigger language plpgsql security definer set search_path = '' as $$
declare first_user uuid; second_user uuid; created_match uuid;
begin
  insert into public.notifications (user_id, room_id, type, actor_user_id)
  values (new.to_user_id, new.room_id, 'like', new.from_user_id);
  if exists (select 1 from public.likes l where l.room_id = new.room_id and l.from_user_id = new.to_user_id and l.to_user_id = new.from_user_id) then
    first_user := least(new.from_user_id, new.to_user_id);
    second_user := greatest(new.from_user_id, new.to_user_id);
    insert into public.matches (room_id, user_one_id, user_two_id)
    values (new.room_id, first_user, second_user)
    on conflict (room_id, user_one_id, user_two_id) do nothing returning id into created_match;
    if created_match is not null then
      insert into public.notifications (user_id, room_id, type, actor_user_id) values
        (new.from_user_id, new.room_id, 'match', new.to_user_id),
        (new.to_user_id, new.room_id, 'match', new.from_user_id);
    end if;
  end if;
  return new;
end;
$$;

create trigger likes_create_notifications_and_match after insert on public.likes
for each row execute function public.handle_like_created();

create or replace function public.deactivate_room_presence()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status in ('ended', 'cancelled') and old.status is distinct from new.status then
    update public.room_presence set active = false, left_at = coalesce(left_at, now())
    where room_id = new.id and active;
  end if;
  return new;
end;
$$;

create trigger rooms_deactivate_presence after update on public.rooms
for each row execute function public.deactivate_room_presence();

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
    'likes', (select count(*) from public.likes where room_id = target_room_id),
    'matches', (select count(*) from public.matches where room_id = target_room_id),
    'avg_likes_per_user', coalesce((select round(count(*)::numeric / nullif(count(distinct from_user_id), 0), 2) from public.likes where room_id = target_room_id), 0),
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
    'upcoming_rooms', count(*) filter (where r.status = 'scheduled' and r.start_at > now()),
    'total_attendees', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id),
    'active_now', (select count(*) from public.room_presence rp join public.rooms rr on rr.id = rp.room_id where rr.organization_id = target_organization_id and rp.active and rp.last_seen_at > now() - interval '90 seconds' and public.is_room_active(rr.id)),
    'likes', (select count(*) from public.likes l join public.rooms rr on rr.id = l.room_id where rr.organization_id = target_organization_id),
    'matches', (select count(*) from public.matches m join public.rooms rr on rr.id = m.room_id where rr.organization_id = target_organization_id)
  ) into result from public.rooms r where r.organization_id = target_organization_id;
  return result;
end;
$$;

-- RLS is the authorization boundary for every application table.
alter table public.profile_intents enable row level security;
alter table public.interests enable row level security;
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.venues enable row level security;
alter table public.rooms enable row level security;
alter table public.room_presence enable row level security;
alter table public.profile_interests enable row level security;
alter table public.likes enable row level security;
alter table public.matches enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.report_reasons enable row level security;
alter table public.reports enable row level security;

create policy "lookup intents readable" on public.profile_intents for select to anon, authenticated using (active);
create policy "lookup interests readable" on public.interests for select to anon, authenticated using (active);
create policy "report reasons readable" on public.report_reasons for select to authenticated using (active);

create policy "profiles scoped read" on public.profiles for select to authenticated using (
  id = auth.uid() or public.users_share_active_room(auth.uid(), id) or public.can_view_reported_profile(id)
);
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "organizations member read" on public.organizations for select to authenticated using (public.is_organization_member(id));
create policy "organizations admin update" on public.organizations for update to authenticated
  using (public.is_organization_member(id, array['owner','admin']::public.organization_role[]))
  with check (public.is_organization_member(id, array['owner','admin']::public.organization_role[]));
create policy "organizations owner delete" on public.organizations for delete to authenticated
  using (public.is_organization_member(id, array['owner']::public.organization_role[]));

create policy "members organization read" on public.organization_members for select to authenticated using (public.is_organization_member(organization_id));
create policy "members admins insert" on public.organization_members for insert to authenticated
  with check (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]));
create policy "members admins update" on public.organization_members for update to authenticated
  using (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]))
  with check (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]));
create policy "members admins delete" on public.organization_members for delete to authenticated
  using (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]));

create policy "venues member read" on public.venues for select to authenticated using (public.is_organization_member(organization_id));
create policy "venues staff insert" on public.venues for insert to authenticated with check (public.is_organization_member(organization_id));
create policy "venues staff update" on public.venues for update to authenticated using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id));
create policy "venues admins delete" on public.venues for delete to authenticated using (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]));

create policy "rooms scoped read" on public.rooms for select to authenticated using (
  public.is_organization_member(organization_id) or exists (select 1 from public.room_presence rp where rp.room_id = id and rp.user_id = auth.uid())
);
create policy "rooms staff insert" on public.rooms for insert to authenticated with check (public.is_organization_member(organization_id));
create policy "rooms staff update" on public.rooms for update to authenticated using (public.is_organization_member(organization_id)) with check (public.is_organization_member(organization_id));
create policy "rooms admins delete" on public.rooms for delete to authenticated using (public.is_organization_member(organization_id, array['owner','admin']::public.organization_role[]));

create policy "presence scoped read" on public.room_presence for select to authenticated using (
  user_id = auth.uid() or public.users_share_active_room(auth.uid(), user_id) or public.can_manage_room(room_id)
);
create policy "presence own insert" on public.room_presence for insert to authenticated with check (user_id = auth.uid() and public.is_room_active(room_id));
create policy "presence own update" on public.room_presence for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "profile interests scoped read" on public.profile_interests for select to authenticated using (
  profile_id = auth.uid() or public.users_share_active_room(auth.uid(), profile_id) or public.can_view_reported_profile(profile_id)
);
create policy "profile interests own insert" on public.profile_interests for insert to authenticated with check (profile_id = auth.uid());
create policy "profile interests own delete" on public.profile_interests for delete to authenticated using (profile_id = auth.uid());

create policy "likes participant read" on public.likes for select to authenticated using (auth.uid() in (from_user_id, to_user_id));
create policy "likes own insert" on public.likes for insert to authenticated with check (
  from_user_id = auth.uid() and public.can_interact_in_room(room_id, from_user_id)
  and public.can_interact_in_room(room_id, to_user_id) and not public.is_blocked_between(from_user_id, to_user_id)
);

create policy "matches participant read" on public.matches for select to authenticated using (
  auth.uid() in (user_one_id, user_two_id) and not public.is_blocked_between(user_one_id, user_two_id)
);
create policy "notifications own read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "blocks own read" on public.blocks for select to authenticated using (blocker_user_id = auth.uid());
create policy "blocks own insert" on public.blocks for insert to authenticated with check (blocker_user_id = auth.uid());
create policy "blocks own delete" on public.blocks for delete to authenticated using (blocker_user_id = auth.uid());

create policy "reports scoped read" on public.reports for select to authenticated using (
  reporter_user_id = auth.uid() or public.can_manage_room(room_id)
);
create policy "reports own insert" on public.reports for insert to authenticated with check (
  reporter_user_id = auth.uid() and public.users_share_active_room(auth.uid(), reported_user_id)
);
create policy "reports organizer update" on public.reports for update to authenticated using (public.can_manage_room(room_id)) with check (public.can_manage_room(room_id));

grant usage on schema public to anon, authenticated;
grant select on public.profile_intents, public.interests to anon;
grant select on public.profile_intents, public.interests, public.report_reasons to authenticated;
grant select, update on public.profiles to authenticated;
grant select, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members, public.venues, public.rooms to authenticated;
grant select, insert, update on public.room_presence to authenticated;
grant select, insert, delete on public.profile_interests, public.blocks to authenticated;
grant select, insert on public.likes to authenticated;
grant select on public.matches to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, update on public.reports to authenticated;

revoke all on function public.create_organization(text, text) from public;
revoke all on function public.join_room(uuid) from public;
revoke all on function public.heartbeat_presence(uuid) from public;
revoke all on function public.leave_room(uuid) from public;
revoke all on function public.discover_room_profiles(uuid, integer, integer) from public;
revoke all on function public.get_room_matches(uuid) from public;
revoke all on function public.get_received_likes(uuid) from public;
revoke all on function public.get_my_notifications(uuid, integer) from public;
revoke all on function public.room_analytics(uuid) from public;
revoke all on function public.organization_dashboard_metrics(uuid) from public;
grant execute on function public.get_public_room(text) to anon, authenticated;
grant execute on function public.create_organization(text, text), public.join_room(uuid), public.heartbeat_presence(uuid), public.leave_room(uuid), public.discover_room_profiles(uuid, integer, integer), public.get_room_matches(uuid), public.get_received_likes(uuid), public.get_my_notifications(uuid, integer), public.room_analytics(uuid), public.organization_dashboard_metrics(uuid) to authenticated;

-- Private avatars: paths must be {user_id}/{random-file-name}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars shared room read" on storage.objects for select to authenticated using (
  bucket_id = 'avatars' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.users_share_active_room(auth.uid(), ((storage.foldername(name))[1])::uuid)
    or public.can_view_reported_profile(((storage.foldername(name))[1])::uuid)
  )
);
create policy "avatars own insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "avatars own update" on storage.objects for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own delete" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Tables where live UI updates are useful. RLS still controls delivered rows.
alter publication supabase_realtime add table public.room_presence;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.notifications;
