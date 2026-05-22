-- Enables Supabase Realtime for Kanban board synchronization.
-- Replica identity full keeps old row values available for DELETE events.

alter table public.board_columns replica identity full;
alter table public.cards replica identity full;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'board_columns'
  ) then
    alter publication supabase_realtime add table public.board_columns;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'cards'
  ) then
    alter publication supabase_realtime add table public.cards;
  end if;
end;
$$;
