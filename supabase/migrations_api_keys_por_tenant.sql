-- ============================================
-- AN.BR — API keys por tenant (AI Agent)
-- Cada negócio pode configurar sua própria chave
-- de IA no painel admin (sem depender do .env do servidor).
-- A chave do servidor continua como fallback.
-- ============================================

ALTER TABLE agent_configs
  ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}';