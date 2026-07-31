-- ============================================
-- AN.BR — Google Calendar Integration
-- ============================================

-- Tokens de autenticação Google por profissional
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  profissional_id UUID PRIMARY KEY REFERENCES profissionais(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT DEFAULT '',
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  calendar_email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos sincronizados (para rastrear qual agendamento gerou qual event)
CREATE TABLE IF NOT EXISTS google_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  google_event_id TEXT NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id, google_event_id)
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_events_profissional ON google_calendar_events(profissional_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_events_agendamento ON google_calendar_events(agendamento_id);

-- RLS
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;

-- Tokens: só o admin (dono) pode ver
DROP POLICY IF EXISTS "google_calendar_tokens_admin_all" ON google_calendar_tokens;
CREATE POLICY "google_calendar_tokens_admin_all" ON google_calendar_tokens
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());

-- Eventos sincronizados: tenant + admin
DROP POLICY IF EXISTS "google_calendar_events_tenant_all" ON google_calendar_events;
CREATE POLICY "google_calendar_events_tenant_all" ON google_calendar_events
  FOR ALL TO authenticated
  USING (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (profissional_id = (SELECT profissional_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "google_calendar_events_admin_all" ON google_calendar_events;
CREATE POLICY "google_calendar_events_admin_all" ON google_calendar_events
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());
