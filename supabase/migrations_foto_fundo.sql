-- Foto de fundo da landing (hero full-bleed com opacidade)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS foto_fundo TEXT DEFAULT '';
