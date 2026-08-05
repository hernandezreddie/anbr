-- ============================================
-- MIGRAÇÃO: Meta Cloud API no WhatsApp Connector
-- Adiciona colunas para conectar via API oficial do WhatsApp (Meta Cloud API),
-- mantendo compatibilidade com a Evolution API.
-- ============================================

-- provider: 'evolution' (padrão atual) ou 'meta_cloud' (API oficial)
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'evolution';
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS phone_number_id TEXT DEFAULT '';
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS waba_id TEXT DEFAULT '';
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS meta_access_token TEXT DEFAULT '';
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS meta_phone_number TEXT DEFAULT '';
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS whatsapp_business_id TEXT DEFAULT '';

COMMENT ON COLUMN whatsapp_instances.provider IS 'evolution = Evolution API (via QR); meta_cloud = API oficial WhatsApp Cloud (Meta)';