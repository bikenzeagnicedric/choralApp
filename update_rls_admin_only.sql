-- Update RLS Policies to restrict write access to Admins only

-- Drop existing strict policies if they conflict (optional, but safer to replace)
drop policy if exists "Authenticated users can insert songs" on public.songs;
drop policy if exists "Users can update own songs" on public.songs;
drop policy if exists "Authenticated users can create masses" on public.masses;
drop policy if exists "Users can update own masses" on public.masses;
drop policy if exists "Authenticated users can manage mass songs" on public.mass_songs;

-- Helper function to check if user is admin is difficult directly in policy without recursion or performance hit if not careful.
-- Standard approach: 
-- (select role from public.profiles where id = auth.uid()) = 'admin'

-- SONGS
create policy "Admins can insert songs" 
on public.songs for insert 
with check (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can update songs" 
on public.songs for update 
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can delete songs" 
on public.songs for delete 
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- MASSES
create policy "Admins can insert masses" 
on public.masses for insert 
with check (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can update masses" 
on public.masses for update 
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can delete masses" 
on public.masses for delete 
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- MASS SONGS
create policy "Admins can manage mass_songs" 
on public.mass_songs for all
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- CATEGORIES (Often strictly admin too)
create policy "Admins can manage categories" 
on public.categories for all
using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
