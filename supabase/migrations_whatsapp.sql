-- ============================================
-- AN.BR — WhatsApp (Evolution API) Connector
-- ============================================

-- Instâncias Evolution API por profissional
CREATE TABLE IF NOT EXISTS whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  instance_token TEXT NOT NULL DEFAULT '',
  evolution_api_url TEXT NOT NULL DEFAULT '',
  evolution_api_key TEXT NOT NULL DEFAULT '',
  connection_status TEXT DEFAULT 'disconnected',
  webhook_secret TEXT DEFAULT '',
  qr_code TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id),
  UNIQUE(instance_name)
);

-- Mensagens WhatsApp sincronizadas
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE SET NULL,
  remote_jid TEXT NOT NULL,
  message_id TEXT NOT NULL,
  from_me BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'text',
  content TEXT DEFAULT '',
  timestamp BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_profissional ON whatsapp_instances(profissional_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_profissional ON whatsapp_messages(profissional_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_remote_jid ON whatsapp_messages(remote_jid);

-- RLS
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Instances: só admin
DROP POLICY IF EXISTS "whatsapp_instances_admin_all" ON whatsapp_instances;
CREATE POLICY "whatsapp_instances_admin_all" ON whatsapp_instances
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Messages: tenant + admin
DROP POLICY IF EXISTS "whatsapp_messages_tenant_all" ON whatsapp_messages;
CREATE POLICY "whatsapp_messages_tenant_all" ON whatsapp_messages
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "whatsapp_messages_admin_all" ON whatsapp_messages;
CREATE POLICY "whatsapp_messages_admin_all" ON whatsapp_messages
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());
