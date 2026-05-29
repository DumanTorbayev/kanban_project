-- Serializes Kanban create flows that derive the next position from existing rows.
-- This avoids duplicate positions when multiple collaborators create cards or columns at the same time.

create or replace function public.create_kanban_column(
  target_board_id uuid,
  column_title text
)
returns table (
  id uuid,
  board_id uuid,
  title text,
  "position" numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_title text := trim(coalesce(column_title, ''));
  next_position numeric;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if length(clean_title) = 0 then
    raise exception 'Column title is required.';
  end if;

  if length(clean_title) > 120 then
    raise exception 'Column title is too long.';
  end if;

  if not public.is_board_member(target_board_id, current_user_id) then
    raise exception 'You do not have access to this board.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('board_columns:' || target_board_id::text, 0)
  );

  select coalesce(max(column_record.position), 0) + 1024
  into next_position
  from public.board_columns as column_record
  where column_record.board_id = target_board_id;

  return query
  insert into public.board_columns (board_id, title, position)
  values (target_board_id, clean_title, next_position)
  returning
    board_columns.id,
    board_columns.board_id,
    board_columns.title,
    board_columns.position,
    board_columns.created_at,
    board_columns.updated_at;
end;
$$;

create or replace function public.create_kanban_card(
  target_board_id uuid,
  target_column_id uuid,
  card_title text,
  card_description text
)
returns table (
  id uuid,
  board_id uuid,
  column_id uuid,
  title text,
  description text,
  "position" numeric,
  created_by uuid,
  assignee_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_title text := trim(coalesce(card_title, ''));
  clean_description text := nullif(trim(coalesce(card_description, '')), '');
  next_position numeric;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if length(clean_title) = 0 then
    raise exception 'Card title is required.';
  end if;

  if length(clean_title) > 120 then
    raise exception 'Card title is too long.';
  end if;

  if length(coalesce(clean_description, '')) > 2000 then
    raise exception 'Card description is too long.';
  end if;

  if not public.is_board_member(target_board_id, current_user_id) then
    raise exception 'You do not have access to this board.';
  end if;

  if not exists (
    select 1
    from public.board_columns as column_record
    where column_record.id = target_column_id
      and column_record.board_id = target_board_id
  ) then
    raise exception 'Column not found on this board.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('cards:' || target_column_id::text, 0)
  );

  select coalesce(max(card_record.position), 0) + 1024
  into next_position
  from public.cards as card_record
  where card_record.board_id = target_board_id
    and card_record.column_id = target_column_id;

  return query
  insert into public.cards (
    board_id,
    column_id,
    title,
    description,
    position,
    created_by
  )
  values (
    target_board_id,
    target_column_id,
    clean_title,
    clean_description,
    next_position,
    current_user_id
  )
  returning
    cards.id,
    cards.board_id,
    cards.column_id,
    cards.title,
    cards.description,
    cards.position,
    cards.created_by,
    cards.assignee_id,
    cards.created_at,
    cards.updated_at;
end;
$$;

revoke all on function public.create_kanban_column(uuid, text) from public;
revoke all on function public.create_kanban_card(uuid, uuid, text, text) from public;
grant execute on function public.create_kanban_column(uuid, text) to authenticated;
grant execute on function public.create_kanban_card(uuid, uuid, text, text) to authenticated;

-- Creation must go through the RPC functions above so position allocation stays atomic.
revoke insert on public.board_columns from authenticated;
revoke insert on public.cards from authenticated;
