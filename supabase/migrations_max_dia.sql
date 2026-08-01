-- Limite máximo de agendamentos por dia (NULL = sem limite)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS max_agendamentos_dia INT DEFAULT NULL;
