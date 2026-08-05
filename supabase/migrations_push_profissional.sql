-- ============================================================
-- AN.BR — Push: correlacionar assinatura com o profissional
-- (user_id de auth.users != profissional_id na maioria dos casos)
-- ============================================================

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_profissional
  ON push_subscriptions(profissional_id);
