-- ============================================
-- AN.BR — Meta (Instagram/Facebook) Connector
-- ============================================

-- Conexões Meta (Facebook Pages)
CREATE TABLE IF NOT EXISTS meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  page_name TEXT DEFAULT '',
  page_access_token TEXT NOT NULL,
  instagram_id TEXT DEFAULT '',
  instagram_name TEXT DEFAULT '',
  expires_at TIMESTAMPTZ,
  webhook_token TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id)
);

-- Mensagens do Meta (Messenger + Instagram)
CREATE TABLE IF NOT EXISTS meta_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('messenger', 'instagram')),
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  timestamp BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meta_connections_profissional ON meta_connections(profissional_id);
CREATE INDEX IF NOT EXISTS idx_meta_messages_profissional ON meta_messages(profissional_id);
CREATE INDEX IF NOT EXISTS idx_meta_messages_sender ON meta_messages(sender_id);

-- RLS
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meta_connections_admin_all" ON meta_connections;
CREATE POLICY "meta_connections_admin_all" ON meta_connections
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

DROP POLICY IF EXISTS "meta_messages_tenant_all" ON meta_messages;
CREATE POLICY "meta_messages_tenant_all" ON meta_messages
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "meta_messages_admin_all" ON meta_messages;
CREATE POLICY "meta_messages_admin_all" ON meta_messages
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());
