-- Rode no Supabase SQL Editor.
-- Consentimento LGPD: registro de aceite no cadastro e no agendamento.

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS consentimento_lgpd BOOLEAN DEFAULT FALSE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS consentimento_data TIMESTAMPTZ;

ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS consentimento_lgpd BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS consentimento_data TIMESTAMPTZ;
