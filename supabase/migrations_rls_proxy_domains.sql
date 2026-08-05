-- ============================================================
-- AN.BR — Fase 3: Resolver domínio custom no proxy edge
-- O proxy (src/proxy.ts) consulta custom_domains como anon
-- (sem sessão). Sem policy anon, qualquer domínio custom
-- respondia 404. A tabela não contém credenciais — apenas
-- domain, profissional_id, cloudflare_hostname_id, ssl_status.
-- ============================================================

DROP POLICY IF EXISTS custom_domains_public_resolve ON custom_domains;
CREATE POLICY custom_domains_public_resolve ON custom_domains
  FOR SELECT TO anon USING (true);

-- Reforço (defensivo): garantir que as tabelas sensíveis NÃO
-- tenham policy anon (já existentes como admin-only — idempotente):
DROP POLICY IF EXISTS whatsapp_instances_anon ON whatsapp_instances;
DROP POLICY IF EXISTS google_calendar_tokens_anon ON google_calendar_tokens;
DROP POLICY IF EXISTS pagamentos_pix_anon ON pagamentos_pix;
DROP POLICY IF EXISTS agent_configs_anon ON agent_configs;
DROP POLICY IF EXISTS custom_domains_anon ON custom_domains;
DROP POLICY IF EXISTS push_subscriptions_anon ON push_subscriptions;
DROP POLICY IF EXISTS pagamentos_anon ON pagamentos;
