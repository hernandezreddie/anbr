-- ============================================================
-- AN.BR — Schema Completo (7 migrations + fixes) v1.0
-- Ejecutar en Supabase SQL Editor (Dashboard) — UNA SOLA VEZ
-- Orden: base → agent → google_calendar → meta → whatsapp → domains → fixes
-- ============================================================

-- ============================================
-- 1. BASE — Tablas principales, RLS, Hooks
-- ============================================

-- 1.1 Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  primeiro_nome TEXT GENERATED ALWAYS AS (SPLIT_PART(nome, ' ', 1)) STORED,
  slogan TEXT DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  pix_chave TEXT NOT NULL,
  pix_nome TEXT DEFAULT '',
  pix_cidade TEXT DEFAULT '',
  template_id INT DEFAULT 1,
  link_avaliacao TEXT DEFAULT '',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Configuracoes (visual)
CREATE TABLE IF NOT EXISTS configuracoes (
  profissional_id UUID PRIMARY KEY REFERENCES profissionais(id) ON DELETE CASCADE,
  template_id INT DEFAULT 1,
  cor_primaria TEXT DEFAULT '#14b8a6',
  cor_secundaria TEXT DEFAULT '#1c1917',
  fonte_titulo TEXT DEFAULT 'Fraunces',
  fonte_corpo TEXT DEFAULT 'Inter',
  logo_url TEXT DEFAULT '',
  slogan TEXT DEFAULT '',
  fundo_estilo TEXT DEFAULT 'none'
);

-- 1.3 Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  descricao_curta TEXT DEFAULT '',
  horas_base DECIMAL(5,2) NOT NULL DEFAULT 2,
  valor_hora DECIMAL(10,2) NOT NULL DEFAULT 30,
  multiplicador DECIMAL(3,2) DEFAULT 1,
  horas_extras DECIMAL(5,2) DEFAULT 0,
  horas_minimas DECIMAL(5,2) DEFAULT 2,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  tipo_preco TEXT DEFAULT 'por_hora' CHECK (tipo_preco IN ('por_hora', 'fixo')),
  preco_fixo DECIMAL(10,2) DEFAULT 0,
  duracao_minutos INT DEFAULT 60
);

-- 1.4 Adicionais
CREATE TABLE IF NOT EXISTS adicionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  preco DECIMAL(10,2) DEFAULT 0,
  horas DECIMAL(5,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

-- 1.5 Frequências
CREATE TABLE IF NOT EXISTS frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  desconto INT DEFAULT 0,
  ordem INT DEFAULT 0,
  UNIQUE(profissional_id, slug)
);

-- 1.6 Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_whatsapp TEXT DEFAULT '',
  cliente_endereco TEXT DEFAULT '',
  cliente_lat DECIMAL(10,7),
  cliente_lng DECIMAL(10,7),
  servico_nome TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  data2 DATE,
  horas DECIMAL(5,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'confirmado', 'concluido', 'cancelado')),
  execucao TEXT,
  recorrencia TEXT,
  adicionais JSONB DEFAULT '[]',
  observacoes TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  origem TEXT DEFAULT 'web',
  serie_id UUID,
  data_original DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  metodo TEXT DEFAULT 'pix',
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  pago_em TIMESTAMPTZ,
  txid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agendamento_id)
);

-- 1.9 Profiles (auth.users ↔ profissional)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 1.11 Índices base
CREATE INDEX IF NOT EXISTS idx_servicos_profissional ON servicos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_adicionais_profissional ON adicionais(profissional_id);
CREATE INDEX IF NOT EXISTS idx_clientes_profissional ON clientes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(profissional_id, data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(profissional_id, status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_profissional ON pagamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento ON pagamentos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- 1.12 RLS Base
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 1.13 Custom Access Token Hook (injeta profissional_id no JWT)
DROP FUNCTION IF EXISTS public.custom_access_token_hook CASCADE;
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claims jsonb;
  user_profissional_id uuid;
BEGIN
  SELECT p.profissional_id INTO user_profissional_id
  FROM public.profiles p
  WHERE p.id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';
  IF user_profissional_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, profissional_id}', to_jsonb(user_profissional_id::text));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END; $$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- 1.14 Admin helper
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;

-- 1.15 RLS Policies Base
DROP POLICY IF EXISTS "profissionais_self_select" ON profissionais;
CREATE POLICY "profissionais_self_select" ON profissionais
  FOR SELECT TO authenticated
  USING (email = (SELECT auth.email()));

DROP POLICY IF EXISTS "profissionais_self_update" ON profissionais;
CREATE POLICY "profissionais_self_update" ON profissionais
  FOR UPDATE TO authenticated
  USING (email = (SELECT auth.email()))
  WITH CHECK (email = (SELECT auth.email()));

DROP POLICY IF EXISTS "profissionais_public_select" ON profissionais;
CREATE POLICY "profissionais_public_select" ON profissionais
  FOR SELECT TO anon
  USING (status = 'ativo');

DROP POLICY IF EXISTS "configuracoes_tenant_select" ON configuracoes;
CREATE POLICY "configuracoes_tenant_select" ON configuracoes
  FOR SELECT TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "configuracoes_public_select" ON configuracoes;
CREATE POLICY "configuracoes_public_select" ON configuracoes
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "servicos_tenant_all" ON servicos;
CREATE POLICY "servicos_tenant_all" ON servicos
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "servicos_public_select" ON servicos;
CREATE POLICY "servicos_public_select" ON servicos
  FOR SELECT TO anon
  USING (ativo = true);

DROP POLICY IF EXISTS "adicionais_tenant_all" ON adicionais;
CREATE POLICY "adicionais_tenant_all" ON adicionais
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "adicionais_public_select" ON adicionais;
CREATE POLICY "adicionais_public_select" ON adicionais
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "frequencias_tenant_all" ON frequencias;
CREATE POLICY "frequencias_tenant_all" ON frequencias
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "frequencias_public_select" ON frequencias;
CREATE POLICY "frequencias_public_select" ON frequencias
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "clientes_tenant_all" ON clientes;
CREATE POLICY "clientes_tenant_all" ON clientes
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "agendamentos_tenant_all" ON agendamentos;
CREATE POLICY "agendamentos_tenant_all" ON agendamentos
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "pagamentos_tenant_all" ON pagamentos;
CREATE POLICY "pagamentos_tenant_all" ON pagamentos
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "profiles_self_select" ON profiles;
CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner());

DROP POLICY IF EXISTS "push_subscriptions_self" ON push_subscriptions;
CREATE POLICY "push_subscriptions_self" ON push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 2. AI AGENT (RAG + Tools + Usage)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 2.1 Agent Configs
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

-- 2.2 Knowledge Docs
CREATE TABLE IF NOT EXISTS knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_count INT DEFAULT 0,
  file_url TEXT DEFAULT '',
  token_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Knowledge Chunks (embeddings)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES knowledge_docs(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Conversations
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

-- 2.5 Messages
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

-- 2.6 Usage (daily)
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

-- 2.7 Índices Agent
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_profissional ON knowledge_docs(profissional_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_profissional ON knowledge_chunks(profissional_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON knowledge_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_profissional ON agent_conversations(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_profissional ON agent_usage(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_date ON agent_usage(profissional_id, date);
CREATE INDEX IF NOT EXISTS idx_agent_configs_tools ON agent_configs USING gin (tools_enabled);
CREATE INDEX IF NOT EXISTS idx_agent_configs_connectors ON agent_configs USING gin (connectors);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_updated_at ON agent_conversations(updated_at);

-- 2.8 Vector Index (HNSW)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 2.9 RLS Agent
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

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

-- 2.10 Upsert Usage Function
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

-- 2.11 Vector Search Function
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

-- ============================================
-- 3. GOOGLE CALENDAR
-- ============================================

CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  profissional_id UUID PRIMARY KEY REFERENCES profissionais(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT DEFAULT '',
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  calendar_email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS google_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  google_event_id TEXT NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id, google_event_id)
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_profissional ON google_calendar_events(profissional_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_events_agendamento ON google_calendar_events(agendamento_id);

ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "google_calendar_tokens_admin_all" ON google_calendar_tokens;
CREATE POLICY "google_calendar_tokens_admin_all" ON google_calendar_tokens
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

DROP POLICY IF EXISTS "google_calendar_events_tenant_all" ON google_calendar_events;
CREATE POLICY "google_calendar_events_tenant_all" ON google_calendar_events
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "google_calendar_events_admin_all" ON google_calendar_events;
CREATE POLICY "google_calendar_events_admin_all" ON google_calendar_events
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- ============================================
-- 4. META (Instagram/Facebook)
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_meta_messages_created_at ON meta_messages(created_at);

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

-- ============================================
-- 5. WHATSAPP (Evolution API)
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_instances_admin_all" ON whatsapp_instances;
CREATE POLICY "whatsapp_instances_admin_all" ON whatsapp_instances
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

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

-- ============================================
-- 6. CUSTOM DOMAINS (Cloudflare for SaaS)
-- ============================================

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  cloudflare_hostname_id TEXT DEFAULT '',
  ssl_status TEXT DEFAULT 'pending',
  ssl_validation_records JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id),
  UNIQUE(domain)
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_domains_admin_all" ON custom_domains;
CREATE POLICY "custom_domains_admin_all" ON custom_domains
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- ============================================
-- 7. FIXES & EXTRAS
-- ============================================

-- 7.1 Increment function
CREATE OR REPLACE FUNCTION increment(x int DEFAULT 1)
RETURNS int
LANGUAGE sql
AS $$ SELECT x $$;

-- 7.2 OAuth States (segurança PKCE)
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

-- 7.3 Storage Buckets (via SQL workaround)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos', 'logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('knowledge', 'knowledge', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "logos_public_select" ON storage.objects;
CREATE POLICY "logos_public_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_authenticated_all" ON storage.objects;
CREATE POLICY "logos_authenticated_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "knowledge_admin_all" ON storage.objects;
CREATE POLICY "knowledge_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'knowledge' AND is_admin_or_owner())
  WITH CHECK (bucket_id = 'knowledge' AND is_admin_or_owner());

-- ============================================================
-- FIN — Schema completo AN.BR v1.0
-- ============================================================