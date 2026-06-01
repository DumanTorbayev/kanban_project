-- Enables Supabase Realtime for dashboard board access synchronization.
-- Board rows drive rename/delete events, while board_members drives access changes.

alter table public.boards replica identity full;
alter table public.board_members replica identity full;

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
      and tablename = 'boards'
  ) then
    alter publication supabase_realtime add table public.boards;
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
      and tablename = 'board_members'
  ) then
    alter publication supabase_realtime add table public.board_members;
  end if;
end;
$$;
