-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create songs table
create table public.songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  lyrics text, -- Legacy or simple text
  lyrics_structure jsonb, -- Structured lyrics: [{type: 'chorus', content: '...'}, {type: 'verse', label: '1', content: '...'}]
  audio_url text,
  video_url text,
  key text,
  duration integer, -- seconds
  category_id uuid references public.categories(id),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create masses table
create table public.masses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date date not null,
  is_published boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mass_songs table (junction)
create table public.mass_songs (
  id uuid default gen_random_uuid() primary key,
  mass_id uuid references public.masses(id) on delete cascade not null,
  song_id uuid references public.songs(id) not null,
  position integer not null,
  liturgical_moment text, -- e.g. "Communion"
  selected_parts jsonb, -- e.g. [0, 2, 4] (indices of lyrics_structure to sing)
  unique(mass_id, position)
);

-- Insert default categories
insert into public.categories (name, slug, order_index) values
('Prélude', 'prelude', 10),
('Entrée', 'entree', 20),
('Kyrie', 'kyrie', 30),
('Gloria', 'gloria', 40),
('Psaume', 'psaume', 50),
('Acclamation', 'acclamation', 60),
('Crédo', 'credo', 70),
('Prière Universelle', 'pu', 80),
('Offertoire', 'offertoire', 90),
('Sanctus', 'sanctus', 100),
('Anamnèse', 'anamnese', 110),
('Pater', 'pater', 120),
('Agnus Dei', 'agnus', 130),
('Communion', 'communion', 140),
('Action de grâce', 'action-de-grace', 150),
('Sortie', 'sortie', 160);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.songs enable row level security;
alter table public.masses enable row level security;
alter table public.mass_songs enable row level security;

-- Policies (Public Read, Authenticated Write for simplicity initially)
-- Categories: Everyone can read
create policy "Public categories are viewable by everyone" on public.categories for select using (true);

-- Songs: Everyone can read
create policy "Songs are viewable by everyone" on public.songs for select using (true);
create policy "Authenticated users can insert songs" on public.songs for insert with check (auth.role() = 'authenticated');
create policy "Users can update own songs" on public.songs for update using (auth.uid() = created_by);

-- Masses: Viewable by everyone (or restricting to members later)
create policy "Masses are viewable by everyone" on public.masses for select using (true);
create policy "Authenticated users can create masses" on public.masses for insert with check (auth.role() = 'authenticated');
create policy "Users can update own masses" on public.masses for update using (auth.uid() = created_by);

-- Mass Songs: Same as Masses
create policy "Mass songs are viewable by everyone" on public.mass_songs for select using (true);
create policy "Authenticated users can manage mass songs" on public.mass_songs for all using (auth.role() = 'authenticated');
