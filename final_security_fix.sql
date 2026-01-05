-- FINAL FIX SCRIPT
-- This script cleans up EVERYTHING and re-applies security permissions correctly.

-- 1. Profiles Table Policies
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );


-- 2. Songs Table Policies
alter table public.songs enable row level security;

drop policy if exists "Authenticated users can insert songs" on public.songs;
drop policy if exists "Users can update own songs" on public.songs;
drop policy if exists "Admins can insert songs" on public.songs;
drop policy if exists "Admins can update songs" on public.songs;
drop policy if exists "Admins can delete songs" on public.songs;

create policy "Admins can insert songs" on public.songs for insert with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Admins can update songs" on public.songs for update using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Admins can delete songs" on public.songs for delete using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Everyone can view songs" on public.songs for select using ( true );


-- 3. Masses Table Policies
alter table public.masses enable row level security;

drop policy if exists "Authenticated users can create masses" on public.masses;
drop policy if exists "Users can update own masses" on public.masses;
drop policy if exists "Admins can insert masses" on public.masses;
drop policy if exists "Admins can update masses" on public.masses;
drop policy if exists "Admins can delete masses" on public.masses;

create policy "Admins can insert masses" on public.masses for insert with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Admins can update masses" on public.masses for update using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Admins can delete masses" on public.masses for delete using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Everyone can view masses" on public.masses for select using ( true );

-- 4. Favorites Table Policies (Just in case)
alter table public.user_favorites enable row level security;

drop policy if exists "Users can view their own favorites" on public.user_favorites;
drop policy if exists "Users can add their own favorites" on public.user_favorites;
drop policy if exists "Users can remove their own favorites" on public.user_favorites;

create policy "Users can view their own favorites" on public.user_favorites for select using ( auth.uid() = user_id );
create policy "Users can add their own favorites" on public.user_favorites for insert with check ( auth.uid() = user_id );
create policy "Users can remove their own favorites" on public.user_favorites for delete using ( auth.uid() = user_id );

-- 5. Trigger for New Users (Ensure it exists without error)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
