-- Allows users to delete their own time entries on boards where they remain members.

drop policy if exists "time_entries_delete_own_member" on public.time_entries;
create policy "time_entries_delete_own_member"
on public.time_entries
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_board_member(board_id, (select auth.uid()))
);

grant delete on public.time_entries to authenticated;
