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
CREATE INDEX IF NOT EXISTS idx_avaliacoes_token ON avaliacoes (token);
CREATE INDEX IF NOT EXISTS idx_agendamentos_token_avaliacao ON agendamentos (token_avaliacao);

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

-- Exclusão: apenas admin da plataforma ou o próprio owner do tenant
DROP POLICY IF EXISTS "avaliacoes_admin_delete" ON avaliacoes;
CREATE POLICY "avaliacoes_admin_delete" ON avaliacoes
  FOR DELETE TO authenticated
  USING (public.is_admin_or_owner() OR (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ) = profissional_id);
