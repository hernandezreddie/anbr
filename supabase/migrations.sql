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
  slogan TEXT DEFAULT ''
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
  data DATE NOT NULL,
  hora TIME NOT NULL,
  data2 DATE,
  horas DECIMAL(5,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'confirmado', 'concluido', 'cancelado')),
  execucao TEXT,
  recorrencia TEXT,
  adicionais JSONB DEFAULT '[]',
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

-- ========== ROW LEVEL SECURITY ==========
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- ========== CUSTOM ACCESS TOKEN HOOK ==========
-- Injeta profissional_id no JWT do usuário logado
-- SECURITY DEFINER é obrigatório: supabase_auth_admin nāo tem acesso a public.profiles
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
CREATE POLICY "profissionais_self_select" ON profissionais
  FOR SELECT TO authenticated
  USING (email = (SELECT auth.email()));

CREATE POLICY "profissionais_self_update" ON profissionais
  FOR UPDATE TO authenticated
  USING (email = (SELECT auth.email()))
  WITH CHECK (email = (SELECT auth.email()));

-- Público pode ler profissionais ativos (para landing pages)
CREATE POLICY "profissionais_public_select" ON profissionais
  FOR SELECT TO anon
  USING (status = 'ativo');

-- Configurações: isolar por profissional_id usando JWT
CREATE POLICY "configuracoes_tenant_select" ON configuracoes
  FOR SELECT TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

-- Público pode ler configurações (para renderizar landing)
CREATE POLICY "configuracoes_public_select" ON configuracoes
  FOR SELECT TO anon
  USING (true);

-- Serviços: isolar por tenant
CREATE POLICY "servicos_tenant_all" ON servicos
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

-- Público pode ler serviços ativos
CREATE POLICY "servicos_public_select" ON servicos
  FOR SELECT TO anon
  USING (ativo = true);

-- Adicionais: isolar por tenant
CREATE POLICY "adicionais_tenant_all" ON adicionais
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

CREATE POLICY "adicionais_public_select" ON adicionais
  FOR SELECT TO anon
  USING (true);

-- Frequências: isolar por tenant
CREATE POLICY "frequencias_tenant_all" ON frequencias
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

CREATE POLICY "frequencias_public_select" ON frequencias
  FOR SELECT TO anon
  USING (true);

-- Clientes: isolar por tenant
CREATE POLICY "clientes_tenant_all" ON clientes
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

-- Agendamentos: isolar por tenant
CREATE POLICY "agendamentos_tenant_all" ON agendamentos
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

-- Pagamentos: isolar por tenant
CREATE POLICY "pagamentos_tenant_all" ON pagamentos
  FOR ALL TO authenticated
  USING (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid)
  WITH CHECK (profissional_id = (
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'profissional_id'
  )::uuid);

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
