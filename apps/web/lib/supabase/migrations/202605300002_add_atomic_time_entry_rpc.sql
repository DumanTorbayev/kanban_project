-- Serializes timer state changes per user.
-- This avoids race conditions between checking the current active timer,
-- stopping it, and creating the next active time entry.

create or replace function public.start_card_timer(
  target_board_id uuid,
  target_card_id uuid
)
returns table (
  entry_role text,
  id uuid,
  board_id uuid,
  card_id uuid,
  user_id uuid,
  started_at timestamptz,
  stopped_at timestamptz,
  duration_seconds integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  active_entry public.time_entries%rowtype;
  new_active_entry public.time_entries%rowtype;
  stopped_entry public.time_entries%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_board_member(target_board_id, current_user_id) then
    raise exception 'You do not have access to this board.';
  end if;

  if not exists (
    select 1
    from public.cards as card_record
    where card_record.id = target_card_id
      and card_record.board_id = target_board_id
  ) then
    raise exception 'Card not found on this board.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  select *
  into active_entry
  from public.time_entries as time_entry
  where time_entry.user_id = current_user_id
    and time_entry.stopped_at is null
  order by time_entry.started_at desc
  limit 1
  for update;

  if active_entry.id is not null
    and active_entry.board_id = target_board_id
    and active_entry.card_id = target_card_id
  then
    return query
    select
      'active'::text,
      active_entry.id,
      active_entry.board_id,
      active_entry.card_id,
      active_entry.user_id,
      active_entry.started_at,
      active_entry.stopped_at,
      active_entry.duration_seconds,
      active_entry.created_at,
      active_entry.updated_at;

    return;
  end if;

  if active_entry.id is not null then
    update public.time_entries as time_entry
    set stopped_at = now()
    where time_entry.id = active_entry.id
      and time_entry.user_id = current_user_id
      and time_entry.stopped_at is null
    returning * into stopped_entry;

    return query
    select
      'stopped'::text,
      stopped_entry.id,
      stopped_entry.board_id,
      stopped_entry.card_id,
      stopped_entry.user_id,
      stopped_entry.started_at,
      stopped_entry.stopped_at,
      stopped_entry.duration_seconds,
      stopped_entry.created_at,
      stopped_entry.updated_at;
  end if;

  insert into public.time_entries (board_id, card_id, user_id)
  values (target_board_id, target_card_id, current_user_id)
  returning * into new_active_entry;

  return query
  select
    'active'::text,
    new_active_entry.id,
    new_active_entry.board_id,
    new_active_entry.card_id,
    new_active_entry.user_id,
    new_active_entry.started_at,
    new_active_entry.stopped_at,
    new_active_entry.duration_seconds,
    new_active_entry.created_at,
    new_active_entry.updated_at;
end;
$$;

create or replace function public.stop_card_timer(
  target_board_id uuid,
  target_card_id uuid,
  target_time_entry_id uuid
)
returns table (
  id uuid,
  board_id uuid,
  card_id uuid,
  user_id uuid,
  started_at timestamptz,
  stopped_at timestamptz,
  duration_seconds integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  stopped_entry public.time_entries%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_board_member(target_board_id, current_user_id) then
    raise exception 'You do not have access to this board.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  update public.time_entries as time_entry
  set stopped_at = now()
  where time_entry.id = target_time_entry_id
    and time_entry.board_id = target_board_id
    and time_entry.card_id = target_card_id
    and time_entry.user_id = current_user_id
    and time_entry.stopped_at is null
  returning * into stopped_entry;

  if stopped_entry.id is null then
    raise exception 'Active timer was not found.';
  end if;

  return query
  select
    stopped_entry.id,
    stopped_entry.board_id,
    stopped_entry.card_id,
    stopped_entry.user_id,
    stopped_entry.started_at,
    stopped_entry.stopped_at,
    stopped_entry.duration_seconds,
    stopped_entry.created_at,
    stopped_entry.updated_at;
end;
$$;

revoke all on function public.start_card_timer(uuid, uuid) from public;
revoke all on function public.stop_card_timer(uuid, uuid, uuid) from public;
grant execute on function public.start_card_timer(uuid, uuid) to authenticated;
grant execute on function public.stop_card_timer(uuid, uuid, uuid) to authenticated;
