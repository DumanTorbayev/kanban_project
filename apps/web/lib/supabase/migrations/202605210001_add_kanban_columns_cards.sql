-- Adds Kanban columns and cards for board workspaces.
-- Access is scoped through board membership helpers from the initial migration.

create table if not exists public.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_columns_title_not_empty check (length(trim(title)) > 0),
  constraint board_columns_position_non_negative check (position >= 0)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.board_columns(id) on delete cascade,
  title text not null,
  description text,
  position numeric not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cards_title_not_empty check (length(trim(title)) > 0),
  constraint cards_position_non_negative check (position >= 0)
);

create index if not exists board_columns_board_id_position_idx
on public.board_columns(board_id, position);

create index if not exists cards_board_id_position_idx
on public.cards(board_id, position);

create index if not exists cards_column_id_position_idx
on public.cards(column_id, position);

create index if not exists cards_created_by_idx
on public.cards(created_by);

create index if not exists cards_assignee_id_idx
on public.cards(assignee_id);

drop trigger if exists set_board_columns_updated_at on public.board_columns;
create trigger set_board_columns_updated_at
before update on public.board_columns
for each row
execute function public.set_updated_at();

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
before update on public.cards
for each row
execute function public.set_updated_at();

create or replace function public.card_matches_column_board()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.board_columns as column_record
    where column_record.id = new.column_id
      and column_record.board_id = new.board_id
  ) then
    raise exception 'Card column must belong to the same board.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_card_column_board on public.cards;
create trigger enforce_card_column_board
before insert or update of board_id, column_id on public.cards
for each row
execute function public.card_matches_column_board();

alter table public.board_columns enable row level security;
alter table public.cards enable row level security;

drop policy if exists "board_columns_select_members" on public.board_columns;
create policy "board_columns_select_members"
on public.board_columns
for select
to authenticated
using (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "board_columns_insert_members" on public.board_columns;
create policy "board_columns_insert_members"
on public.board_columns
for insert
to authenticated
with check (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "board_columns_update_members" on public.board_columns;
create policy "board_columns_update_members"
on public.board_columns
for update
to authenticated
using (public.is_board_member(board_id, (select auth.uid())))
with check (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "board_columns_delete_owner" on public.board_columns;
create policy "board_columns_delete_owner"
on public.board_columns
for delete
to authenticated
using (public.is_board_owner(board_id, (select auth.uid())));

drop policy if exists "cards_select_members" on public.cards;
create policy "cards_select_members"
on public.cards
for select
to authenticated
using (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "cards_insert_members" on public.cards;
create policy "cards_insert_members"
on public.cards
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.is_board_member(board_id, (select auth.uid()))
);

drop policy if exists "cards_update_members" on public.cards;
create policy "cards_update_members"
on public.cards
for update
to authenticated
using (public.is_board_member(board_id, (select auth.uid())))
with check (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "cards_delete_owner" on public.cards;
create policy "cards_delete_owner"
on public.cards
for delete
to authenticated
using (public.is_board_owner(board_id, (select auth.uid())));

grant select, insert, update, delete on public.board_columns to authenticated;
grant select, insert, update, delete on public.cards to authenticated;
