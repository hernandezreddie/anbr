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
