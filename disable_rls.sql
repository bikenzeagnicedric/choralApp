-- Option 1: Désactiver RLS temporairement (pour développement uniquement)
-- ATTENTION: Ne pas faire en production !
ALTER TABLE public.songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.masses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mass_songs DISABLE ROW LEVEL SECURITY;

-- Option 2: Permettre les insertions/modifications sans authentification (plus sûr)
-- Décommentez les lignes ci-dessous si vous préférez cette approche

-- DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
-- DROP POLICY IF EXISTS "Users can update own songs" ON public.songs;

-- CREATE POLICY "Anyone can insert songs" 
--   ON public.songs FOR INSERT 
--   WITH CHECK (true);

-- CREATE POLICY "Anyone can update songs" 
--   ON public.songs FOR UPDATE 
--   USING (true);

-- CREATE POLICY "Anyone can delete songs" 
--   ON public.songs FOR DELETE 
--   USING (true);
