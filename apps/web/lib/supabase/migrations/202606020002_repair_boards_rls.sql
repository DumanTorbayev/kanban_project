-- Re-applies board ownership RLS policies used by authenticated create/update/delete flows.

alter table public.boards enable row level security;

drop policy if exists "boards_select_members" on public.boards;
create policy "boards_select_members"
on public.boards
for select
to authenticated
using (public.is_board_member(id, (select auth.uid())));

drop policy if exists "boards_insert_owner" on public.boards;
create policy "boards_insert_owner"
on public.boards
for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "boards_update_owner" on public.boards;
create policy "boards_update_owner"
on public.boards
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "boards_delete_owner" on public.boards;
create policy "boards_delete_owner"
on public.boards
for delete
to authenticated
using (owner_id = (select auth.uid()));

grant select, insert, update, delete on public.boards to authenticated;
