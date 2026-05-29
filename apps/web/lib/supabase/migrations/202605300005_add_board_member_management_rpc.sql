-- Adds board member management RPCs for real collaboration.
-- Users are invited by an existing profile email; email delivery is a later product step.

create or replace function public.is_board_manager(
  target_board_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members as member
    where member.board_id = target_board_id
      and member.user_id = target_user_id
      and member.role in ('owner', 'admin')
  );
$$;

create or replace function public.get_board_members(target_board_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_board_member(target_board_id, current_user_id) then
    raise exception 'You do not have access to this board.';
  end if;

  return query
  select
    member.user_id,
    profile.email,
    profile.full_name,
    profile.avatar_url,
    member.role,
    member.created_at
  from public.board_members as member
  join public.profiles as profile on profile.id = member.user_id
  where member.board_id = target_board_id
  order by
    case member.role
      when 'owner' then 0
      when 'admin' then 1
      else 2
    end,
    profile.email nulls last,
    member.created_at;
end;
$$;

create or replace function public.invite_board_member(
  target_board_id uuid,
  invitee_email text,
  member_role text default 'member'
)
returns table (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_email text := lower(trim(coalesce(invitee_email, '')));
  clean_role text := coalesce(member_role, 'member');
  invitee public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if clean_email = '' then
    raise exception 'Member email is required.';
  end if;

  if clean_role not in ('admin', 'member') then
    raise exception 'Member role is invalid.';
  end if;

  if not public.is_board_manager(target_board_id, current_user_id) then
    raise exception 'Only board owners and admins can invite members.';
  end if;

  select *
  into invitee
  from public.profiles as profile
  where lower(profile.email) = clean_email
  limit 1;

  if invitee.id is null then
    raise exception 'User with this email was not found.';
  end if;

  insert into public.board_members (board_id, user_id, role)
  values (target_board_id, invitee.id, clean_role)
  on conflict (board_id, user_id) do update
  set role = case
    when public.board_members.role = 'owner' then public.board_members.role
    else excluded.role
  end;

  return query
  select *
  from public.get_board_members(target_board_id) as member
  where member.user_id = invitee.id;
end;
$$;

create or replace function public.update_board_member_role(
  target_board_id uuid,
  target_user_id uuid,
  member_role text
)
returns table (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_role text := coalesce(member_role, 'member');
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if clean_role not in ('admin', 'member') then
    raise exception 'Member role is invalid.';
  end if;

  if not public.is_board_manager(target_board_id, current_user_id) then
    raise exception 'Only board owners and admins can update members.';
  end if;

  if public.is_board_owner(target_board_id, target_user_id) then
    raise exception 'Board owner role cannot be changed.';
  end if;

  update public.board_members as member
  set role = clean_role
  where member.board_id = target_board_id
    and member.user_id = target_user_id;

  if not found then
    raise exception 'Board member was not found.';
  end if;

  return query
  select *
  from public.get_board_members(target_board_id) as member
  where member.user_id = target_user_id;
end;
$$;

create or replace function public.remove_board_member(
  target_board_id uuid,
  target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_board_manager(target_board_id, current_user_id) then
    raise exception 'Only board owners and admins can remove members.';
  end if;

  if public.is_board_owner(target_board_id, target_user_id) then
    raise exception 'Board owner cannot be removed.';
  end if;

  delete from public.board_members as member
  where member.board_id = target_board_id
    and member.user_id = target_user_id;

  if not found then
    raise exception 'Board member was not found.';
  end if;

  return target_user_id;
end;
$$;

revoke all on function public.is_board_manager(uuid, uuid) from public;
revoke all on function public.get_board_members(uuid) from public;
revoke all on function public.invite_board_member(uuid, text, text) from public;
revoke all on function public.update_board_member_role(uuid, uuid, text) from public;
revoke all on function public.remove_board_member(uuid, uuid) from public;

grant execute on function public.get_board_members(uuid) to authenticated;
grant execute on function public.invite_board_member(uuid, text, text) to authenticated;
grant execute on function public.update_board_member_role(uuid, uuid, text) to authenticated;
grant execute on function public.remove_board_member(uuid, uuid) to authenticated;
