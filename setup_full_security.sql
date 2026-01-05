-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user'::text check (role in ('user', 'admin', 'moderator')),

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Create Trigger for new users (Handle new signups automatically)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$;

-- Drop trigger if exists to avoid error on recreation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Update RLS Policies for Admin Only Access (Songs & Masses)

-- Songs
drop policy if exists "Authenticated users can insert songs" on public.songs;
drop policy if exists "Users can update own songs" on public.songs;
drop policy if exists "Admins can insert songs" on public.songs;
drop policy if exists "Admins can update songs" on public.songs;
drop policy if exists "Admins can delete songs" on public.songs;

create policy "Admins can insert songs" 
on public.songs for insert 
with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update songs" 
on public.songs for update 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete songs" 
on public.songs for delete 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Masses
drop policy if exists "Authenticated users can create masses" on public.masses;
drop policy if exists "Users can update own masses" on public.masses;
drop policy if exists "Admins can insert masses" on public.masses;
drop policy if exists "Admins can update masses" on public.masses;
drop policy if exists "Admins can delete masses" on public.masses;

create policy "Admins can insert masses" 
on public.masses for insert 
with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update masses" 
on public.masses for update 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete masses" 
on public.masses for delete 
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Mass Songs
drop policy if exists "Authenticated users can manage mass_songs" on public.mass_songs;
drop policy if exists "Admins can manage mass_songs" on public.mass_songs;

create policy "Admins can manage mass_songs" 
on public.mass_songs for all
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Categories
drop policy if exists "Admins can manage categories" on public.categories;

create policy "Admins can manage categories" 
on public.categories for all
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
