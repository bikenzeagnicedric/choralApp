-- FORCE CLEANUP of existing policies to fix "Policy already exists" error
-- Run this script to reset all permissions

-- 1. Disable RLS temporarily to ensure no partial lock
alter table public.songs disable row level security;
alter table public.masses disable row level security;

-- 2. DROP ALL potentially conflicting policies
drop policy if exists "Authenticated users can insert songs" on public.songs;
drop policy if exists "Users can update own songs" on public.songs;
drop policy if exists "Admins can insert songs" on public.songs;
drop policy if exists "Admins can update songs" on public.songs;
drop policy if exists "Admins can delete songs" on public.songs;

drop policy if exists "Authenticated users can create masses" on public.masses;
drop policy if exists "Users can update own masses" on public.masses;
drop policy if exists "Admins can insert masses" on public.masses;
drop policy if exists "Admins can update masses" on public.masses;
drop policy if exists "Admins can delete masses" on public.masses;

-- 3. Re-enable RLS
alter table public.songs enable row level security;
alter table public.masses enable row level security;

-- 4. Re-create Admin Policies (Safe now)
create policy "Admins can insert songs" 
on public.songs for insert 
with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update songs" 
on public.songs for update 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete songs" 
on public.songs for delete 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can insert masses" 
on public.masses for insert 
with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update masses" 
on public.masses for update 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete masses" 
on public.masses for delete 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
