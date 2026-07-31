-- ============================================
-- AN.BR — Fixes: functions, indexes, buckets
-- ============================================

-- 1. Função increment para message_count
CREATE OR REPLACE FUNCTION increment(x int DEFAULT 1)
RETURNS int
LANGUAGE sql
AS $$ SELECT x $$;

-- 2. Corrigir match_knowledge_chunks (id uuid, não bigint)
DROP FUNCTION IF EXISTS match_knowledge_chunks;
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_profissional_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  doc_id uuid,
  content text,
  chunk_index int,
  filename text,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.doc_id,
    kc.content,
    kc.chunk_index,
    kd.filename,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  JOIN knowledge_docs kd ON kd.id = kc.doc_id
  WHERE
    (filter_profissional_id IS NULL OR kc.profissional_id = filter_profissional_id)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Índices GIN para JSONB
CREATE INDEX IF NOT EXISTS idx_agent_configs_tools ON agent_configs USING gin (tools_enabled);
CREATE INDEX IF NOT EXISTS idx_agent_configs_connectors ON agent_configs USING gin (connectors);

-- 4. Índice em created_at para mensagens
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_updated_at ON agent_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_meta_messages_created_at ON meta_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- 5. Adicionar updated_at em knowledge_docs
ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Tabela para OAuth states (segurança)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT UNIQUE NOT NULL,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "oauth_states_admin_all" ON oauth_states;
CREATE POLICY "oauth_states_admin_all" ON oauth_states
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- 7. Buckets de Storage (via SQL function workaround)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('knowledge', 'knowledge', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Policy para logos (público)
DROP POLICY IF EXISTS "logos_public_select" ON storage.objects;
CREATE POLICY "logos_public_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_authenticated_all" ON storage.objects;
CREATE POLICY "logos_authenticated_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy para knowledge (só admin)
DROP POLICY IF EXISTS "knowledge_admin_all" ON storage.objects;
CREATE POLICY "knowledge_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'knowledge' AND is_admin_or_owner())
  WITH CHECK (bucket_id = 'knowledge' AND is_admin_or_owner());
