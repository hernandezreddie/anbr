-- ============================================================
-- AN.BR — Fix RLS: permitir INSERT anônimo em agendamentos/clientes
-- Motivo: POST /api/agendamentos (reserva pública) usava o cliente anon
-- e era bloqueado com 42501 → a reserva NUNCA era persistida.
-- O GET anônimo (slots ocupados) já existia na DB live mas não estava
-- versionado no repo — aqui fica explícito.
-- ============================================================

-- 1) SELECT público (slots ocupados do dia) — normaliza e versiona
DROP POLICY IF EXISTS "agendamentos_anon_select" ON agendamentos;
CREATE POLICY "agendamentos_anon_select" ON agendamentos
  FOR SELECT TO anon
  USING (true);

-- 2) INSERT público de agendamentos — apenas para profissionais ATIVOS
--    (o resto da validação: conflito, limite diário, plano, preço —
--    é feita no POST /api/agendamentos antes do insert)
DROP POLICY IF EXISTS "agendamentos_anon_insert" ON agendamentos;
CREATE POLICY "agendamentos_anon_insert" ON agendamentos
  FOR INSERT TO anon
  WITH CHECK (
    profissional_id IN (SELECT id FROM profissionais WHERE status = 'ativo')
  );

-- 3) INSERT público de clientes — mesmo critério
DROP POLICY IF EXISTS "clientes_anon_insert" ON clientes;
CREATE POLICY "clientes_anon_insert" ON clientes
  FOR INSERT TO anon
  WITH CHECK (
    profissional_id IN (SELECT id FROM profissionais WHERE status = 'ativo')
  );

-- 4) UPDATE próprio agendamento pelo token de avaliação (rota /avaliar)
--    não é necessário: a avaliação usa o API com validação de token.
--    (mantido explícito para documentar a decisão)
