-- Fix: Admin users can access any tenant's data
-- Admins (role = 'admin' or 'plataforma') bypass tenant isolation
-- This allows superusers to browse tenant panels for support/debug

-- Helper function to check if current user is a platform admin
CREATE OR REPLACE FUNCTION is_platform_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'plataforma')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendamentos: allow admin full access
DROP POLICY IF EXISTS "agendamentos_tenant_all" ON agendamentos;
CREATE POLICY "agendamentos_tenant_all" ON agendamentos
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Pagamentos: allow admin full access
DROP POLICY IF EXISTS "pagamentos_tenant_all" ON pagamentos;
CREATE POLICY "pagamentos_tenant_all" ON pagamentos
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Configuracoes: allow admin full access
DROP POLICY IF EXISTS "configuracoes_tenant_select" ON configuracoes;
CREATE POLICY "configuracoes_tenant_select" ON configuracoes
  FOR SELECT TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Profissionais: allow admin full access
DROP POLICY IF EXISTS "profissionais_self_select" ON profissionais;
CREATE POLICY "profissionais_self_select" ON profissionais
  FOR SELECT TO authenticated
  USING (
    id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profissionais_self_update" ON profissionais;
CREATE POLICY "profissionais_self_update" ON profissionais
  FOR UPDATE TO authenticated
  USING (
    id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Servicos: allow admin full access
DROP POLICY IF EXISTS "servicos_tenant_all" ON servicos;
CREATE POLICY "servicos_tenant_all" ON servicos
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Adicionales: allow admin full access
DROP POLICY IF EXISTS "adicionais_tenant_all" ON adicionais;
CREATE POLICY "adicionais_tenant_all" ON adicionais
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Clientes: allow admin full access
DROP POLICY IF EXISTS "clientes_tenant_all" ON clientes;
CREATE POLICY "clientes_tenant_all" ON clientes
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );

-- Frequencias: allow admin full access
DROP POLICY IF EXISTS "frequencias_tenant_all" ON frequencias;
CREATE POLICY "frequencias_tenant_all" ON frequencias
  FOR ALL TO authenticated
  USING (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid())
    OR is_platform_admin(auth.uid())
  );
