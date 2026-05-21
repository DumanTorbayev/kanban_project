-- Initial auth and board access schema.
-- Creates public profiles, boards, board members, ownership triggers, and RLS policies.

create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_title_not_empty check (length(trim(title)) > 0)
);

create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (board_id, user_id),
  constraint board_members_role_check check (role in ('owner', 'admin', 'member'))
);

create index if not exists boards_owner_id_idx on public.boards(owner_id);
create index if not exists board_members_user_id_idx on public.board_members(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
before update on public.boards
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.add_board_owner_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (board_id, user_id) do update
  set role = 'owner';

  return new;
end;
$$;

drop trigger if exists on_board_created_add_owner_member on public.boards;
create trigger on_board_created_add_owner_member
after insert on public.boards
for each row
execute function public.add_board_owner_member();

create or replace function public.is_board_member(
  target_board_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members as member
    where member.board_id = target_board_id
      and member.user_id = target_user_id
  );
$$;

create or replace function public.is_board_owner(
  target_board_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boards as board
    where board.id = target_board_id
      and board.owner_id = target_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

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

drop policy if exists "board_members_select_board_members" on public.board_members;
create policy "board_members_select_board_members"
on public.board_members
for select
to authenticated
using (public.is_board_member(board_id, (select auth.uid())));

drop policy if exists "board_members_insert_owner" on public.board_members;
create policy "board_members_insert_owner"
on public.board_members
for insert
to authenticated
with check (public.is_board_owner(board_id, (select auth.uid())));

drop policy if exists "board_members_update_owner" on public.board_members;
create policy "board_members_update_owner"
on public.board_members
for update
to authenticated
using (public.is_board_owner(board_id, (select auth.uid())))
with check (public.is_board_owner(board_id, (select auth.uid())));

drop policy if exists "board_members_delete_owner" on public.board_members;
create policy "board_members_delete_owner"
on public.board_members
for delete
to authenticated
using (public.is_board_owner(board_id, (select auth.uid())));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.boards to authenticated;
grant select, insert, update, delete on public.board_members to authenticated;
grant execute on function public.is_board_member(uuid, uuid) to authenticated;
grant execute on function public.is_board_owner(uuid, uuid) to authenticated;
