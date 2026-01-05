-- Create user_favorites table
create table public.user_favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (user_id, song_id)
);

-- Enable Row Level Security (RLS)
alter table public.user_favorites enable row level security;

-- Policies
create policy "Users can view their own favorites"
  on public.user_favorites for select
  using ( auth.uid() = user_id );

create policy "Users can add their own favorites"
  on public.user_favorites for insert
  with check ( auth.uid() = user_id );

create policy "Users can remove their own favorites"
  on public.user_favorites for delete
  using ( auth.uid() = user_id );
