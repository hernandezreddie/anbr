-- Textos personalizados da landing page (edição manual do profissional)
-- Campos opcionais que sobrescrevem o copy padrão por nicho/variante.
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS textos_personalizados JSONB;

COMMENT ON COLUMN configuracoes.textos_personalizados IS
  'JSON perfil de textos da landing editados manualmente. Sobrescreve getCopyPadrao por campo.';