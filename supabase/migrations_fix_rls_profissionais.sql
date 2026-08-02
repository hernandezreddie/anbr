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
