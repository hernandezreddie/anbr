-- ============================================
-- AN.BR — AI Agent System (RAG + Tools + Usage)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Configuração do AI Agent por profissional
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  system_prompt TEXT DEFAULT '',
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  tools_enabled JSONB DEFAULT '[]',
  connectors JSONB DEFAULT '{}',
  webhook_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id)
);

-- 2. Documentos de conhecimento (RAG)
CREATE TABLE IF NOT EXISTS knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_count INT DEFAULT 0,
  file_url TEXT DEFAULT '',
  token_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chunks de documentos com embeddings
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES knowledge_docs(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversas do agente
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'web',
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_id TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mensagens individuais
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB DEFAULT NULL,
  tool_results JSONB DEFAULT NULL,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  model TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Uso de tokens (resumo diário)
CREATE TABLE IF NOT EXISTS agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  messages INT DEFAULT 0,
  conversations INT DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  UNIQUE(profissional_id, date)
);

-- ========== ÍNDICES ==========
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_profissional ON knowledge_docs(profissional_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_profissional ON knowledge_chunks(profissional_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON knowledge_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_profissional ON agent_conversations(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_profissional ON agent_usage(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_date ON agent_usage(profissional_id, date);

-- ========== VECTOR INDEX (HNSW) ==========
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ========== ROW LEVEL SECURITY ==========
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

-- Agent configs: tenant + admin
DROP POLICY IF EXISTS "agent_configs_tenant_all" ON agent_configs;
CREATE POLICY "agent_configs_tenant_all" ON agent_configs
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agent_configs_admin_all" ON agent_configs;
CREATE POLICY "agent_configs_admin_all" ON agent_configs
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Knowledge docs: tenant + admin
DROP POLICY IF EXISTS "knowledge_docs_tenant_all" ON knowledge_docs;
CREATE POLICY "knowledge_docs_tenant_all" ON knowledge_docs
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "knowledge_docs_admin_all" ON knowledge_docs;
CREATE POLICY "knowledge_docs_admin_all" ON knowledge_docs
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Knowledge chunks: tenant + admin
DROP POLICY IF EXISTS "knowledge_chunks_tenant_all" ON knowledge_chunks;
CREATE POLICY "knowledge_chunks_tenant_all" ON knowledge_chunks
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "knowledge_chunks_admin_all" ON knowledge_chunks;
CREATE POLICY "knowledge_chunks_admin_all" ON knowledge_chunks
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Conversations: tenant + admin
DROP POLICY IF EXISTS "agent_conversations_tenant_all" ON agent_conversations;
CREATE POLICY "agent_conversations_tenant_all" ON agent_conversations
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agent_conversations_admin_all" ON agent_conversations;
CREATE POLICY "agent_conversations_admin_all" ON agent_conversations
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Messages: tenant + admin
DROP POLICY IF EXISTS "agent_messages_tenant_all" ON agent_messages;
CREATE POLICY "agent_messages_tenant_all" ON agent_messages
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agent_messages_admin_all" ON agent_messages;
CREATE POLICY "agent_messages_admin_all" ON agent_messages
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Usage: tenant + admin
DROP POLICY IF EXISTS "agent_usage_tenant_all" ON agent_usage;
CREATE POLICY "agent_usage_tenant_all" ON agent_usage
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agent_usage_admin_all" ON agent_usage;
CREATE POLICY "agent_usage_admin_all" ON agent_usage
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- ========== UPSERT DE USO DIÁRIO ==========
DROP FUNCTION IF EXISTS upsert_agent_usage;
CREATE OR REPLACE FUNCTION upsert_agent_usage(
  p_profissional_id UUID,
  p_date DATE,
  p_tokens_input INT,
  p_tokens_output INT,
  p_messages INT,
  p_cost DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.agent_usage (profissional_id, date, tokens_input, tokens_output, messages, conversations, cost)
  VALUES (p_profissional_id, p_date, p_tokens_input, p_tokens_output, p_messages, 0, p_cost)
  ON CONFLICT (profissional_id, date)
  DO UPDATE SET
    tokens_input = agent_usage.tokens_input + p_tokens_input,
    tokens_output = agent_usage.tokens_output + p_tokens_output,
    messages = agent_usage.messages + p_messages,
    cost = agent_usage.cost + p_cost;
END;
$$;

-- ========== FUNÇÃO DE BUSCA VETORIAL ==========
DROP FUNCTION IF EXISTS match_knowledge_chunks;
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_profissional_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
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
