-- Fixes "column reference \"user_id\" is ambiguous" raised by invite_board_member.
-- The RETURNS TABLE output columns (user_id, role, ...) shadow board_members
-- columns inside the INSERT ... ON CONFLICT statement, where the conflict
-- target cannot be table-qualified. Resolving conflicts to the column wins.

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
#variable_conflict use_column
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

revoke all on function public.invite_board_member(uuid, text, text) from public;
grant execute on function public.invite_board_member(uuid, text, text) to authenticated;
