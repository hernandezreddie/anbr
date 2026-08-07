-- ============================================================
-- AN.BR — SCHEMA COMPLETO CANÔNICO (gerado de migrações ordenadas)
-- Data: 2026-08-05
-- Aplicar em uma BD NOVA na ordem abaixo (NÃO executar sobre BD existente)
-- ============================================================

-- ============ migrations.sql ============
-- ============================================
-- LIVRETA — Schema Multi-Tenant
-- Ejecutar en Supabase SQL Editor (Dashboard)
-- ============================================

-- 1. Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  primeiro_nome TEXT GENERATED ALWAYS AS (
    SPLIT_PART(nome, ' ', 1)
  ) STORED,
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

-- 2. Configuração visual do template
CREATE TABLE IF NOT EXISTS configuracoes (
  profissional_id UUID PRIMARY KEY REFERENCES profissionais(id) ON DELETE CASCADE,
  template_id INT DEFAULT 1,
  cor_primaria TEXT DEFAULT '#059669',
  cor_secundaria TEXT DEFAULT '#1c1917',
  fonte_titulo TEXT DEFAULT 'Fraunces',
  fonte_corpo TEXT DEFAULT 'Inter',
  logo_url TEXT DEFAULT '',
  slogan TEXT DEFAULT '',
  fundo_estilo TEXT DEFAULT 'none'
);

-- 3. Serviços do profissional
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

-- 4. Adicionais por serviço
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

-- 5. Frequências / recorrência
CREATE TABLE IF NOT EXISTS frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  desconto INT DEFAULT 0,
  ordem INT DEFAULT 0,
  UNIQUE(profissional_id, slug)
);

-- 6. Clientes
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

-- 7. Agendamentos
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

-- 8. Pagamentos
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

-- 9. Perfil de usuário (liga auth.users ao profissional)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Assinaturas Web Push para notificações no painel
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========== ÍNDICES ==========
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

-- ========== ROW LEVEL SECURITY ==========
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ========== CUSTOM ACCESS TOKEN HOOK ==========
-- Injeta profissional_id no JWT do usuário logado
-- SECURITY DEFINER é obrigatório: supabase_auth_admin nāo tem acesso a public.profiles
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

-- Conceder permissão para o hook ser chamado pelo Supabase Auth
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- ========== RLS POLICIES ==========

-- Profissionais: cada um vê apenas seu próprio registro
DROP POLICY IF EXISTS "profissionais_self_select" ON profissionais;
CREATE POLICY "profissionais_self_select" ON profissionais
  FOR SELECT TO authenticated
  USING (email = (SELECT auth.email()));

DROP POLICY IF EXISTS "profissionais_self_update" ON profissionais;
CREATE POLICY "profissionais_self_update" ON profissionais
  FOR UPDATE TO authenticated
  USING (email = (SELECT auth.email()))
  WITH CHECK (email = (SELECT auth.email()));

-- Público pode ler profissionais ativos (para landing pages)
DROP POLICY IF EXISTS "profissionais_public_select" ON profissionais;
CREATE POLICY "profissionais_public_select" ON profissionais
  FOR SELECT TO anon
  USING (status = 'ativo');

-- Configurações: isolar por profissional_id via profiles table
DROP POLICY IF EXISTS "configuracoes_tenant_select" ON configuracoes;
CREATE POLICY "configuracoes_tenant_select" ON configuracoes
  FOR SELECT TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Público pode ler configurações (para renderizar landing)
DROP POLICY IF EXISTS "configuracoes_public_select" ON configuracoes;
CREATE POLICY "configuracoes_public_select" ON configuracoes
  FOR SELECT TO anon
  USING (true);

-- Serviços: isolar por tenant
DROP POLICY IF EXISTS "servicos_tenant_all" ON servicos;
CREATE POLICY "servicos_tenant_all" ON servicos
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Público pode ler serviços ativos
DROP POLICY IF EXISTS "servicos_public_select" ON servicos;
CREATE POLICY "servicos_public_select" ON servicos
  FOR SELECT TO anon
  USING (ativo = true);

-- Adicionais: isolar por tenant
DROP POLICY IF EXISTS "adicionais_tenant_all" ON adicionais;
CREATE POLICY "adicionais_tenant_all" ON adicionais
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "adicionais_public_select" ON adicionais;
CREATE POLICY "adicionais_public_select" ON adicionais
  FOR SELECT TO anon
  USING (true);

-- Frequências: isolar por tenant
DROP POLICY IF EXISTS "frequencias_tenant_all" ON frequencias;
CREATE POLICY "frequencias_tenant_all" ON frequencias
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "frequencias_public_select" ON frequencias;
CREATE POLICY "frequencias_public_select" ON frequencias
  FOR SELECT TO anon
  USING (true);

-- Clientes: isolar por tenant
DROP POLICY IF EXISTS "clientes_tenant_all" ON clientes;
CREATE POLICY "clientes_tenant_all" ON clientes
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Agendamentos: isolar por tenant
DROP POLICY IF EXISTS "agendamentos_tenant_all" ON agendamentos;
CREATE POLICY "agendamentos_tenant_all" ON agendamentos
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Pagamentos: isolar por tenant
DROP POLICY IF EXISTS "pagamentos_tenant_all" ON pagamentos;
CREATE POLICY "pagamentos_tenant_all" ON pagamentos
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Profiles: cada user vê apenas seu próprio profile
DROP POLICY IF EXISTS "profiles_self_select" ON profiles;
CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin/owner pode ver todos os profiles (security definer evita recursion)
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
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
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner());

-- Push subscriptions: cada user só vê/gerencia a própria
DROP POLICY IF EXISTS "push_subscriptions_self" ON push_subscriptions;
CREATE POLICY "push_subscriptions_self" ON push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ========== DADOS DE EXEMPLO ==========
-- Inserir um profissional de teste (descomentar para testar)
-- INSERT INTO profissionais (slug, nome, email, whatsapp, pix_chave, cidade)
-- VALUES ('caridad-teste', 'Caridad Ceregido Teste', 'caridad@email.com', '5541984226267', '09772499991', 'Curitiba');
--
-- INSERT INTO configuracoes (profissional_id, slogan)
-- VALUES ((SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'Limpeza profissional em Curitiba');
--
-- INSERT INTO servicos (profissional_id, nome, descricao, horas_base, valor_hora, horas_minimas, ordem)
-- VALUES
--   ((SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'Limpeza Padrão', 'Manutenção do dia a dia', 2.5, 30, 3, 1),
--   ((SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'Limpeza Pesada', 'Faxina completa e detalhada', 2.5, 35, 7, 2),
--   ((SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'Comercial', 'Escritórios e lojas', 2, 35, 3, 3),
--   ((SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'Passadoria', 'Roupas passadas com capricho', 0, 25, 2, 4);


-- ============ migrations_consentimento.sql ============
-- Rode no Supabase SQL Editor.
-- Consentimento LGPD: registro de aceite no cadastro e no agendamento.

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS consentimento_lgpd BOOLEAN DEFAULT FALSE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS consentimento_data TIMESTAMPTZ;

ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS consentimento_lgpd BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS consentimento_data TIMESTAMPTZ;


-- ============ migrations_agent.sql ============
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


-- ============ migrations_whatsapp.sql ============
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


-- ============ migrations_whatsapp_meta.sql ============
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

-- ============ migrations_meta.sql ============
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


-- ============ migrations_google_calendar.sql ============
-- ============================================
-- AN.BR — Google Calendar Integration
-- ============================================

-- Tokens de autenticação Google por profissional
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

-- Eventos sincronizados (para rastrear qual agendamento gerou qual event)
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

-- RLS
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;

-- Tokens: só o admin (dono) pode ver
DROP POLICY IF EXISTS "google_calendar_tokens_admin_all" ON google_calendar_tokens;
CREATE POLICY "google_calendar_tokens_admin_all" ON google_calendar_tokens
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Eventos sincronizados: tenant + admin
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


-- ============ migrations_avaliacoes.sql ============
-- Rode no Supabase SQL Editor.
-- Avaliações públicas dos clientes na landing (sem login, via token por agendamento).

ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS token_avaliacao TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS convite_avaliacao_enviado BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  token TEXT UNIQUE,
  cliente_nome TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  texto TEXT DEFAULT '',
  aprovada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_profissional ON avaliacoes (profissional_id);

-- ===== RLS (obrigatório: sem isso a anon key pública permite inserir avaliações falsas direto pela REST) =====
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Público: só lê aprovadas
DROP POLICY IF EXISTS "avaliacoes_public_select" ON avaliacoes;
CREATE POLICY "avaliacoes_public_select" ON avaliacoes
  FOR SELECT TO anon, authenticated
  USING (aprovada = true);

-- Profissional autenticado: vê e modera as próprias (mesmo padrão tenant das outras tabelas)
DROP POLICY IF EXISTS "avaliacoes_tenant_all" ON avaliacoes;
CREATE POLICY "avaliacoes_tenant_all" ON avaliacoes
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- NÃO há policy de INSERT para anon: criação só via API (/api/avaliacoes usa service role, que faz bypass do RLS)


-- ============ migrations_promocoes.sql ============
-- Promoções (ofertas ativadas manualmente pelo profissional)
CREATE TABLE IF NOT EXISTS promocoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  texto TEXT DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'porcentagem' CHECK (tipo IN ('porcentagem', 'fixo')),
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  dias_semana TEXT[] DEFAULT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promocoes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_promocoes_profissional ON promocoes(profissional_id);

-- Profissional gerencia as próprias promoções
DROP POLICY IF EXISTS "promocoes_tenant_all" ON promocoes;
CREATE POLICY "promocoes_tenant_all" ON promocoes
  FOR ALL TO authenticated
  USING (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ))
  WITH CHECK (profissional_id = (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ));

-- Público pode ler apenas promoções ativas
DROP POLICY IF EXISTS "promocoes_public_select" ON promocoes;
CREATE POLICY "promocoes_public_select" ON promocoes
  FOR SELECT TO anon
  USING (ativo = true);


-- ============ migrations_planos.sql ============
-- ============================================
-- MIGRAÇÃO: PLANOS (Pix manual MVP)
-- Executar no SQL Editor do Supabase
-- ============================================

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS plano TEXT NOT NULL DEFAULT 'gratis'
    CHECK (plano IN ('gratis', 'profissional', 'ia_premium')),
  ADD COLUMN IF NOT EXISTS plano_expira_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_pagamento TIMESTAMPTZ;

-- Configurações da plataforma (Pix para receber pagamentos de planos)
CREATE TABLE IF NOT EXISTS config_plataforma (
  id INT PRIMARY KEY DEFAULT 1,
  pix_chave TEXT DEFAULT '',
  pix_nome TEXT DEFAULT '',
  pix_cidade TEXT DEFAULT '',
  whatsapp TEXT DEFAULT ''
);

INSERT INTO config_plataforma (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Somente o admin da plataforma gerencia config_plataforma (RLS)
ALTER TABLE config_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plataforma_admin_select" ON config_plataforma
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "plataforma_admin_update" ON config_plataforma
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Pedidos de assinatura via Pix manual (gerenciados pelo admin)
CREATE TABLE IF NOT EXISTS pagamentos_pix (
  id BIGSERIAL PRIMARY KEY,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  plano TEXT NOT NULL CHECK (plano IN ('profissional', 'ia_premium')),
  frequencia TEXT NOT NULL DEFAULT 'mensal' CHECK (frequencia IN ('mensal', 'anual')),
  valor REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  pix_copia_e_cola TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  pago_em TIMESTAMPTZ
);

ALTER TABLE pagamentos_pix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagamentos_admin_all" ON pagamentos_pix
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- CORREÇÃO DE SEGURANÇA (roles da plataforma)
-- "admin" = dono da plataforma (único com acesso ao /admin)
-- "owner" = dono de tenant (cliente) — sem acesso ao /admin
-- ============================================

-- Antes, qualquer "owner" (cliente) via todos os profiles de todos os tenants.
-- Agora apenas admin da plataforma.
DROP FUNCTION IF EXISTS public.is_admin_or_owner CASCADE;
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin_or_owner());


-- ============ migrations_domains.sql ============
-- ============================================
-- AN.BR — Custom Domains (Cloudflare for SaaS)
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


-- ============ migrations_landing_categorias.sql ============
-- Landing por tipo de negocio: copys consistentes por categoría
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outro';


-- ============ migrations_lembretes.sql ============
-- Rode no Supabase SQL Editor.
-- Marca quando o lembrete automático de agendamento já foi enviado (evita reenvio).
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS msg_lembrete_enviado BOOLEAN DEFAULT FALSE;


-- ============ migrations_max_dia.sql ============
-- Limite máximo de agendamentos por dia (NULL = sem limite)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS max_agendamentos_dia INT DEFAULT NULL;


-- ============ migrations_msg_variante.sql ============
-- Adiciona a coluna msg_variante (estilo das mensagens de WhatsApp)
-- Rode junto com migrations_copy_variante.sql no Supabase SQL Editor.
-- Se já rodou migrations_copy_variante.sql, rode também:
--   ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS msg_variante INT DEFAULT 0;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS msg_variante INT DEFAULT 0;


-- ============ migrations_copy_variante.sql ============
-- Variantes de texto do site (estilo de copy escolhido no cadastro/painel)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS copy_variante INT DEFAULT 0;


-- ============ migrations_foto_fundo.sql ============
-- Foto de fundo da landing (hero full-bleed com opacidade)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS foto_fundo TEXT DEFAULT '';


-- ============ migrations_video_fundo.sql ============
-- Video de fundo da landing (opcional, com prioridade sobre foto_fundo)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS video_fundo TEXT;



-- ============ migrations_redes.sql ============
-- Rode no Supabase SQL Editor.
-- Links das redes sociais que aparecem no rodapé da landing de cada profissional.
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS facebook TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS google_maps TEXT DEFAULT '';


-- ============ migrations_textos_personalizados.sql ============
-- Textos personalizados da landing page (edição manual do profissional)
-- Campos opcionais que sobrescrevem o copy padrão por nicho/variante.
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS textos_personalizados JSONB;

COMMENT ON COLUMN configuracoes.textos_personalizados IS
  'JSON perfil de textos da landing editados manualmente. Sobrescreve getCopyPadrao por campo.';

-- ============ migrations_horarios.sql ============
-- Horário de atendimento (minutos desde 00:00; NULL = padrão 08:00–20:00)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_inicio INT DEFAULT NULL;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_fim INT DEFAULT NULL;

-- ============ migrations_api_keys_por_tenant.sql ============
-- ============================================
-- AN.BR — API keys por tenant (AI Agent)
-- Cada negócio pode configurar sua própria chave
-- de IA no painel admin (sem depender do .env do servidor).
-- A chave do servidor continua como fallback.
-- ============================================

ALTER TABLE agent_configs
  ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}';

-- ============ migrations_fix_all.sql ============
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


-- ============ migrations_fix_rls_profissionais.sql ============
-- Fix: profissionais não carregava no painel
-- Causa: policies usavam email = auth.email() (que falha quando o JWT não tem
-- a claim de email ou difere em caixa/normalização).
-- Solução: mesmo padrão tenant via profiles usado em servicos/adicionais/etc.

DROP POLICY IF EXISTS "profissionais_self_select" ON profissionais;
CREATE POLICY "profissionais_self_select" ON profissionais
  FOR SELECT TO authenticated
  USING (id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "profissionais_self_update" ON profissionais;
CREATE POLICY "profissionais_self_update" ON profissionais
  FOR UPDATE TO authenticated
  USING (id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

-- Configuracoes: permitir UPDATE do próprio tenant (fallback; painel usa API
-- com service role, mas assim o cliente autenticado também pode salvar direto)
DROP POLICY IF EXISTS "configuracoes_tenant_update" ON configuracoes;
CREATE POLICY "configuracoes_tenant_update" ON configuracoes
  FOR UPDATE TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));


-- ============================================================
-- SEED OPCIONAL: seed.sql (dados de exemplo)
-- ============================================================
