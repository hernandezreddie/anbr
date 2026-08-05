-- ============================================================
-- AN.BR — Índice único parcial: impede duplicar o mesmo horário
-- exato por profissional/data (defesa contra race condition no
-- POST /api/agendamentos). O conflito por sobreposição de duração
-- é validado em aplicação; este índice cobre o caso exato.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS agendamentos_horario_unico
  ON agendamentos (profissional_id, data, hora)
  WHERE status <> 'cancelado';
