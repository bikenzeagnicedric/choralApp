-- Fix RLS policies for categories table to allow inserts

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

-- Recreate policies with proper permissions
CREATE POLICY "Public categories are viewable by everyone" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" 
  ON public.categories FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" 
  ON public.categories FOR DELETE 
  USING (auth.role() = 'authenticated');
