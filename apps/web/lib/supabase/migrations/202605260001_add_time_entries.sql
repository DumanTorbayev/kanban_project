-- Adds task time tracking sessions.
-- A paused or stopped timer is stored as a completed time entry.

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_entries_duration_non_negative check (duration_seconds >= 0),
  constraint time_entries_stopped_after_started check (
    stopped_at is null
    or stopped_at >= started_at
  )
);

create index if not exists time_entries_board_id_started_at_idx
on public.time_entries(board_id, started_at desc);

create index if not exists time_entries_card_id_started_at_idx
on public.time_entries(card_id, started_at desc);

create index if not exists time_entries_user_id_started_at_idx
on public.time_entries(user_id, started_at desc);

create unique index if not exists time_entries_one_active_per_user_idx
on public.time_entries(user_id)
where stopped_at is null;

drop trigger if exists set_time_entries_updated_at on public.time_entries;
create trigger set_time_entries_updated_at
before update on public.time_entries
for each row
execute function public.set_updated_at();

create or replace function public.time_entry_matches_card_board()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.cards as card_record
    where card_record.id = new.card_id
      and card_record.board_id = new.board_id
  ) then
    raise exception 'Time entry card must belong to the same board.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_time_entry_card_board on public.time_entries;
create trigger enforce_time_entry_card_board
before insert or update of board_id, card_id on public.time_entries
for each row
execute function public.time_entry_matches_card_board();

create or replace function public.set_time_entry_duration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stopped_at is null then
    new.duration_seconds = 0;
  else
    new.duration_seconds = greatest(
      0,
      floor(extract(epoch from (new.stopped_at - new.started_at)))::integer
    );
  end if;

  return new;
end;
$$;

drop trigger if exists calculate_time_entry_duration on public.time_entries;
create trigger calculate_time_entry_duration
before insert or update of started_at, stopped_at on public.time_entries
for each row
execute function public.set_time_entry_duration();

alter table public.time_entries enable row level security;

drop policy if exists "time_entries_select_members" on public.time_entries;
create policy "time_entries_select_members"
on public.time_entries
for select
to authenticated
using (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "time_entries_insert_own_member" on public.time_entries;
create policy "time_entries_insert_own_member"
on public.time_entries
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_board_member(board_id, (select auth.uid()))
);

drop policy if exists "time_entries_update_own_member" on public.time_entries;
create policy "time_entries_update_own_member"
on public.time_entries
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_board_member(board_id, (select auth.uid()))
)
with check (
  user_id = (select auth.uid())
  and public.is_board_member(board_id, (select auth.uid()))
);

grant select, insert, update on public.time_entries to authenticated;

alter table public.time_entries replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'time_entries'
  ) then
    alter publication supabase_realtime add table public.time_entries;
  end if;
end;
$$;
