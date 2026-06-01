-- Enables Supabase Realtime for board membership collaboration.
-- Replica identity full keeps old row values available for DELETE events.

alter table public.board_members replica identity full;

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
      and tablename = 'board_members'
  ) then
    alter publication supabase_realtime add table public.board_members;
  end if;
end;
$$;
