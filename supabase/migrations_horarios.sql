-- Horário de atendimento por profissional (minutos desde 00:00; NULL = padrão 08:00–20:00)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_inicio INT DEFAULT NULL;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS horario_fim INT DEFAULT NULL;
