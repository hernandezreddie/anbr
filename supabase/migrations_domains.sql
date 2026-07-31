-- ============================================
-- AN.BR — Custom Domains (Cloudflare for SaaS)
-- ============================================

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  cloudflare_hostname_id TEXT DEFAULT '',
  ssl_status TEXT DEFAULT 'pending',
  ssl_validation_records JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id),
  UNIQUE(domain)
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_domains_admin_all" ON custom_domains;
CREATE POLICY "custom_domains_admin_all" ON custom_domains
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner())
  WITH CHECK (public.is_admin_or_owner());
