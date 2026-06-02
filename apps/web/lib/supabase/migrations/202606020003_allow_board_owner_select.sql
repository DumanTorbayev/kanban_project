-- Allows INSERT RETURNING on boards before the board_members after-insert trigger is visible to RLS.

drop policy if exists "boards_select_members" on public.boards;
create policy "boards_select_members"
on public.boards
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or public.is_board_member(id, (select auth.uid()))
);
