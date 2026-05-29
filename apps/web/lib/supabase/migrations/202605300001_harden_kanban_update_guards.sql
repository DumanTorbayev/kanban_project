-- Hardens Kanban updates beyond RLS membership checks.
-- Members may still collaborate on titles, descriptions, positions, and card columns,
-- but immutable identity fields cannot be rewritten through direct client updates.

create or replace function public.prevent_board_column_identity_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Column id cannot be changed.';
  end if;

  if new.board_id is distinct from old.board_id then
    raise exception 'Column board cannot be changed.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Column creation timestamp cannot be changed.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_board_column_identity_update on public.board_columns;
create trigger prevent_board_column_identity_update
before update on public.board_columns
for each row
execute function public.prevent_board_column_identity_update();

create or replace function public.prevent_card_identity_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Card id cannot be changed.';
  end if;

  if new.board_id is distinct from old.board_id then
    raise exception 'Card board cannot be changed.';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Card creator cannot be changed.';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Card creation timestamp cannot be changed.';
  end if;

  if new.column_id is distinct from old.column_id
    and not exists (
      select 1
      from public.board_columns as column_record
      where column_record.id = new.column_id
        and column_record.board_id = old.board_id
    )
  then
    raise exception 'Card cannot be moved to a column from another board.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_card_identity_update on public.cards;
create trigger prevent_card_identity_update
before update on public.cards
for each row
execute function public.prevent_card_identity_update();
