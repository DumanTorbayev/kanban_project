-- Hardens card reordering for real-time collaboration.
-- The client sends the intended neighboring cards, while Postgres allocates
-- the final position under a per-column advisory lock.

alter table public.boards
drop constraint if exists boards_title_max_length;
alter table public.boards
add constraint boards_title_max_length check (length(trim(title)) <= 120);

alter table public.board_columns
drop constraint if exists board_columns_title_max_length;
alter table public.board_columns
add constraint board_columns_title_max_length check (length(trim(title)) <= 120);

alter table public.cards
drop constraint if exists cards_title_max_length;
alter table public.cards
add constraint cards_title_max_length check (length(trim(title)) <= 120);

alter table public.cards
drop constraint if exists cards_description_max_length;
alter table public.cards
add constraint cards_description_max_length check (
  description is null
  or length(trim(description)) <= 2000
);

create or replace function public.move_kanban_card(
  target_board_id uuid,
  target_card_id uuid,
  target_column_id uuid,
  previous_card_id uuid,
  next_card_id uuid
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
  moved_card public.cards%rowtype;
  next_position numeric;
  previous_position numeric;
  following_position numeric;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
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

  if previous_card_id is not null and previous_card_id = target_card_id then
    raise exception 'Previous card cannot be the moved card.';
  end if;

  if next_card_id is not null and next_card_id = target_card_id then
    raise exception 'Next card cannot be the moved card.';
  end if;

  if previous_card_id is not null
    and next_card_id is not null
    and previous_card_id = next_card_id
  then
    raise exception 'Previous and next card cannot be the same card.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('cards:' || target_column_id::text, 0)
  );

  select *
  into moved_card
  from public.cards as card_record
  where card_record.id = target_card_id
    and card_record.board_id = target_board_id
  for update;

  if moved_card.id is null then
    raise exception 'Card not found on this board.';
  end if;

  if previous_card_id is not null then
    select card_record.position
    into previous_position
    from public.cards as card_record
    where card_record.id = previous_card_id
      and card_record.board_id = target_board_id
      and card_record.column_id = target_column_id;

    if previous_position is null then
      raise exception 'Previous card not found in target column.';
    end if;
  end if;

  if next_card_id is not null then
    select card_record.position
    into following_position
    from public.cards as card_record
    where card_record.id = next_card_id
      and card_record.board_id = target_board_id
      and card_record.column_id = target_column_id;

    if following_position is null then
      raise exception 'Next card not found in target column.';
    end if;
  end if;

  if previous_position is not null
    and following_position is not null
    and previous_position >= following_position
  then
    raise exception 'Card order bounds are invalid.';
  end if;

  if previous_position is not null and following_position is not null then
    next_position := (previous_position + following_position) / 2;
  elsif previous_position is not null then
    next_position := previous_position + 1024;
  elsif following_position is not null then
    next_position := following_position / 2;
  else
    select coalesce(max(card_record.position), 0) + 1024
    into next_position
    from public.cards as card_record
    where card_record.board_id = target_board_id
      and card_record.column_id = target_column_id
      and card_record.id <> target_card_id;
  end if;

  return query
  update public.cards as card_record
  set
    column_id = target_column_id,
    position = next_position
  where card_record.id = target_card_id
    and card_record.board_id = target_board_id
  returning
    card_record.id,
    card_record.board_id,
    card_record.column_id,
    card_record.title,
    card_record.description,
    card_record.position,
    card_record.created_by,
    card_record.assignee_id,
    card_record.created_at,
    card_record.updated_at;
end;
$$;

revoke all on function public.move_kanban_card(uuid, uuid, uuid, uuid, uuid) from public;
grant execute on function public.move_kanban_card(uuid, uuid, uuid, uuid, uuid) to authenticated;

-- Column-level grants keep direct edits narrow. Reordering goes through RPC.
revoke update on public.boards from authenticated;
revoke update on public.board_columns from authenticated;
revoke update on public.cards from authenticated;
grant update(title) on public.boards to authenticated;
grant update(title) on public.board_columns to authenticated;
grant update(title, description, assignee_id) on public.cards to authenticated;
