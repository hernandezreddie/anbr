-- Rode no Supabase SQL Editor.
-- Links das redes sociais que aparecem no rodapé da landing de cada profissional.
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS facebook TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS google_maps TEXT DEFAULT '';
