-- ============================================================
-- AN.BR — Lembrete do MESMO DIA (além do de amanhã)
-- ============================================================

ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS msg_lembrete_mesmo_dia_enviado BOOLEAN DEFAULT FALSE;
