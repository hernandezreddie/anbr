-- Rode no Supabase SQL Editor.
-- Marca quando o lembrete automático de agendamento já foi enviado (evita reenvio).
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS msg_lembrete_enviado BOOLEAN DEFAULT FALSE;
