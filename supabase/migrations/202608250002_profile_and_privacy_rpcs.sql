-- Transactional profile onboarding and stronger avatar-path integrity.
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and (avatar_path is null or split_part(avatar_path, '/', 1) = auth.uid()::text)
);

create or replace function public.complete_onboarding(
  profile_name text,
  profile_age smallint,
  profile_bio text,
  profile_intent_id uuid,
  selected_interest_ids uuid[],
  new_avatar_path text default null
)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare result public.profiles; valid_interests integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(profile_name)) not between 1 and 60 or profile_age not between 18 and 99 then raise exception 'Invalid profile'; end if;
  if profile_bio is not null and char_length(profile_bio) > 240 then raise exception 'Bio is too long'; end if;
  if not exists (select 1 from public.profile_intents where id = profile_intent_id and active) then raise exception 'Invalid intent'; end if;
  if coalesce(array_length(selected_interest_ids, 1), 0) not between 1 and 8 then raise exception 'Select between 1 and 8 interests'; end if;
  select count(distinct id) into valid_interests from public.interests where id = any(selected_interest_ids) and active;
  if valid_interests <> array_length(selected_interest_ids, 1) then raise exception 'Invalid interests'; end if;
  if new_avatar_path is not null and split_part(new_avatar_path, '/', 1) <> auth.uid()::text then raise exception 'Invalid avatar path'; end if;

  update public.profiles set display_name = trim(profile_name), age = profile_age,
    bio = nullif(trim(profile_bio), ''), intent_id = profile_intent_id,
    avatar_path = coalesce(new_avatar_path, avatar_path), onboarding_completed = true
  where id = auth.uid() returning * into result;
  delete from public.profile_interests where profile_id = auth.uid();
  insert into public.profile_interests (profile_id, interest_id)
    select auth.uid(), interest_id from unnest(selected_interest_ids) as interest_id;
  return result;
end;
$$;

revoke all on function public.complete_onboarding(text, smallint, text, uuid, uuid[], text) from public;
grant execute on function public.complete_onboarding(text, smallint, text, uuid, uuid[], text) to authenticated;

