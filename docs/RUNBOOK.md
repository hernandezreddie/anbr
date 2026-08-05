# RUNBOOK — Operações AN.BR

## Alta de novo piloto (profissional)

### Via SQL (recomendado para batch)
```sql
-- 1. Criar profissional
INSERT INTO profissionais (slug, nome, primeiro_nome, slogan, cidade, email, whatsapp, pix_chave, pix_nome, pix_cidade, status)
VALUES ('nome-slug', 'Nome Completo', '', 'Slogan do serviço', 'Cidade', 'email@provedor.com', '55DDD999999999', 'chave-pix', 'Nome Pix', 'Cidade Pix', 'ativo');

-- 2. Configuração visual
INSERT INTO configuracoes (profissional_id, template_id, cor_primaria, slogan)
SELECT id, 1, '#059669', slogan FROM profissionais WHERE slug = 'nome-slug';

-- 3. Serviços
INSERT INTO servicos (profissional_id, nome, descricao, descricao_curta, horas_base, valor_hora, horas_minimas, tipo_preco, preco_fixo, duracao_minutos, ordem)
SELECT p.id, 'Serviço Exemplo', 'Descrição detalhada', 'Resumo curto', 2, 30, 2, 'por_hora', 0, 0, 1
FROM profissionais p WHERE p.slug = 'nome-slug';

-- 4. Frequências
INSERT INTO frequencias (profissional_id, nome, slug, desconto, ordem)
SELECT p.id, f.nome, f.slug, f.desconto, f.ordem
FROM profissionais p CROSS JOIN (VALUES
  ('Única', 'unica', 0, 1),
  ('Semanal', 'semanal', 10, 2),
  ('Quinzenal', 'quinzenal', 5, 3),
  ('Mensal', 'mensal', 15, 4)
) AS f(nome, slug, desconto, ordem)
WHERE p.slug = 'nome-slug';
```

### Via painel admin
1. Acessar `https://autonexabrasil.com.br/admin`
2. Clicar em **Novo tenant** → preencher slug, nome, email
3. O profissional acessa `/{slug}/painel/login` com o email cadastrado

---

## Planos (ativar/estender)

### Manual (SQL)
```sql
UPDATE profissionais SET plano = 'pro', plano_expira_em = NOW() + INTERVAL '30 days' WHERE slug = 'nome-slug';
```

### Via gateway (Mercado Pago)
- O profissional acessa `/{slug}/painel/plano` e paga via PIX
- O webhook `/api/webhooks/mercadopago` confirma automaticamente e estende o plano

### Verificar status
```sql
SELECT slug, nome, plano, plano_expira_em, plano_desde FROM profissionais WHERE status = 'ativo';
```

---

## WhatsApp

### Conectar instância (Evolution API)
1. Acessar Evolution API Dashboard (externo)
2. Criar instância com nome `bella-beleza` (ex: slug)
3. No painel AN.BR: `/{slug}/painel` → Configurações → WhatsApp → colar URL + API key
4. Escanear QR code para conectar o WhatsApp

### Conectar via Meta Cloud API
1. Acessar Meta Developer → WhatsApp → Configuração
2. Gerar Access Token permanente
3. No `.env`: `WHATSAPP_ACCESS_TOKEN=...`, `META_APP_SECRET=...`
4. Configurar webhook: URL = `https://autonexabrasil.com.br/api/meta/webhook`

### Mensagens não enviadas
- Verificar logs em Vercel/Netlify → Functions Logs
- Reenviar confirmação manual via painel de agendamentos → botão "Reenviar"

---

## Backups

### Supabase
- Dashboard → Database → Backups
- Restauração: criar novo projeto e apontar env vars

### Export manual
```bash
pg_dump postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres > backup_$(date +%Y%m%d).sql
```

---

## Deploy

### Produção (Vercel)
```bash
# Configurar env vars no dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... todas as demais vars

# Deploy
git push origin main
# Conectado via Vercel GitHub integration

# Crons verificáveis
GET /api/agendamentos/lembretes  (diário 12:00)
GET /api/planos/vencidos (diário 03:00)
```

### Staging / Preview
- Cada branch gera preview URL automaticamente (Vercel)
- Testar migrações primeiro em staging

---

## Troubleshooting

### Agendamento não gera WhatsApp
1. Verificar `/{slug}/painel` → Status do WhatsApp (conectado?)
2. Testar `GET /api/health` → campo `whatsapp`
3. Ver se template Meta foi aprovado (App Review)

### PIX não confirmado
1. `GET /api/health` → logs
2. Verificar webhook MP em Mercado Pago Dashboard → Webhooks → últimos eventos
3. Testar polling manual: acessar `/{slug}/painel/plano` → "Já paguei"

### AI Agent não responde
1. `/{slug}/painel/agente` → StatusAgente (diagnóstico)
2. Verificar cota: `SELECT * FROM agent_usage WHERE profissional_id = '...' AND created_at > NOW() - INTERVAL '30 days'`
3. Logs: Vercel Functions → `api/agent/chat`

### Health Check
```
GET https://autonexabrasil.com.br/api/health
→ { "status": "healthy", "checks": { "db": {...}, "whatsapp": {...}, "cron": {...} } }
```
Se `status` = "degraded", verificar o campo `detail` de cada check.

---

## Contatos de emergência
- Supabase: dashboard.supabase.com → Support
- Vercel: vercel.com → Support
- Meta Developer: developers.facebook.com → App Dashboard
- Mercado Pago: dashboard.mercadopago.com
