-- Adiciona a coluna msg_variante (estilo das mensagens de WhatsApp)
-- Rode junto com migrations_copy_variante.sql no Supabase SQL Editor.
-- Se já rodou migrations_copy_variante.sql, rode também:
--   ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS msg_variante INT DEFAULT 0;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS msg_variante INT DEFAULT 0;
