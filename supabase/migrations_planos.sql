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
