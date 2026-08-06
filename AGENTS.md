<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 📋 PROJECT MEMORY — AUTOMATIZACURITIBA26
**Last updated:** 2026-08-05
**Status:** ✅ PRODUCTION READY — Fases 0–9 ✅. Sistema completo con seguridad, home pulida, dashboard inteligente y AI Ads MVP.

---

### 🎯 OBJECTIVE
Plataforma SaaS multi-tenant para profissionais autônomos: landing page, booking flow, pagos PIX, AI Agent multi-canal (WhatsApp/Instagram/Facebook), Google Calendar, dominios custom, painel completo con onboarding guiado, insights proactivos y AI Ads.

---

### 🔑 KEY FILES (actualizados)
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | **Homepage AN.BR** — Copy optimizado CRO + SEO + diseño premium |
| `src/app/layout.tsx` | SEO metadata + Schema.org + Open Graph |
| `src/app/(slug)/[slug]/reservar/page.tsx` | Server entry, loads config via `getProfissionalFullConfig(slug)` |
| `src/app/(slug)/[slug]/reservar/ReservarClient.tsx` | **Main client component** — stepper 6 pasos, URL sync |
| `src/app/(slug)/[slug]/painel/page.tsx` | **Painel home** — métricas, agenda, QR Pix, onboarding wizard, insights |
| `src/app/(slug)/[slug]/painel/ads/page.tsx` | **AI Ads** — generador de copys, segmentación y presupuesto |
| `src/proxy.ts` | **Proxy/Middleware unificado** — custom domains + CSRF + CSP + security headers |
| `src/lib/whatsapp.ts` | `mensagemReserva()`, `linkWhatsApp()` |
| `src/lib/precos.ts` | `estimar()` — service quote calculator |
| `src/lib/ai/ads.ts` | **AI Ads engine** — brief automático, generación de copys, segmentación |
| `src/lib/ai/tool-definitions.ts` | `buildAgentTools` + `toOpenAITools` — tools compartidas |
| `src/components/painel/OnboardingWizard.tsx` | **Nuevo** — wizard 4 pasos para nuevos prestadores |
| `src/components/painel/DashboardCharts.tsx` | **Nuevo** — gráficos faturamento, taxa de ocupação + métricas |
| `src/lib/notificacoes.ts` | Templates Meta + fallback texto libre |
| `src/lib/whatsapp/meta.ts` | Meta Cloud: sendText (24h), sendTemplate |
| `src/lib/whatsapp/evolution.ts` | Evolution API + fallback Meta Cloud |
| `src/lib/meta/graph.ts` | OAuth Meta + webhook multi-tenant |
| `src/lib/google/oauth.ts` | OAuth Google + calendar_email |
| `src/lib/rate-limit.ts` | Rate limiting in-memory (agendamentos 5/min, cadastro 3/min, agent 10/min) |
| `src/lib/pagamentos/mercadopago.ts` | Gateway PIX dinámico Mercado Pago |
| `src/lib/webhook-firma.ts` | `validarAssinaturaMeta` — HMAC SHA256 |

### 🆕 FASE 8.5–9 NUEVOS FILES
| File | Purpose |
|------|---------|
| `src/proxy.ts` | **Unificado** — CSRF validation + CSP headers + custom domains + security headers |
| `src/components/painel/OnboardingWizard.tsx` | Wizard 4 pasos: WhatsApp → Página → Serviços → Google Calendar |
| `src/components/painel/InsightCard.tsx` | Sugerencias proactivas con CTAs inline |
| `src/lib/ai/ads.ts` | **AI Ads engine**: brief + headlines + segmentación + presupuesto + dicas |
| `src/app/(slug)/[slug]/painel/ads/page.tsx` | Server entry AI Ads |
| `src/app/(slug)/[slug]/painel/ads/AdsClient.tsx` | **AI Ads UI** — selector objetivo, generación copys, copy-to-clipboard |

### ✅ COMPLETED (v1.0 → v2.0)

#### Fase 8.5 — Barrido de Seguridad
- [x] `CREDENTIAL_VAULT.md` limpiado (sin secrets reales, está en `.gitignore`)
- [x] `src/proxy.ts` unificado: CSRF validation (Origin/Referer check en POST/PATCH/DELETE)
- [x] Whitelist webhooks + crons del CSRF check
- [x] CSP header en `next.config.ts` + `netlify.toml`
- [x] Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Permissions-Policy`
- [x] Evolution webhook → `crypto.timingSafeEqual` (fix comparación vulnerable)
- [x] Meta HMAC: removido fallback `WHATSAPP_ACCESS_TOKEN`, solo `META_APP_SECRET`
- [x] `/api/health` protegido con Bearer token
- [x] `/api/cadastro` con rate limit 3/min

#### Fase 8.6 — Home Sweep
- [x] Hero headline más específico: "Seu negócio inteiro no digital" + badge "Grátis · 5 min · Sem cartão"
- [x] Nueva sección "Antes vs Depois" con 3 comparaciones visuales (rojo/verde)
- [x] Beneficios unificados con `destaque` tag (Zap icon)
- [x] "Como funciona" con time-to-value ("2 min", "3 min", "Instantâneo")
- [x] Pricing 3 columnas con feature lists + badge "MAIS POPULAR"
- [x] Stats bar con `AnimatedCounter` (scroll-triggered)
- [x] FAQ con nueva pregunta: "Vale a pena R$ 49?"
- [x] CTA final con garantía: "Sem cartão · Cancele quando quiser · Sem multa"
- [x] Footer en columnas (Produto, Conteúdo, Legal)
- [x] SEO: OG image, meta description, keywords ampliadas

#### Fase 8.7 — Dashboard Mejoras
- [x] `OnboardingWizard`: 4 pasos con progreso en localStorage, "Pular tour", "Já fiz isso"
- [x] `InsightCard`: faltas, cota agotada, link no compartido, crecimiento
- [x] Integrados en painel home (después del UpgradeBanner, antes de stats)

#### Fase 9 — AI Ads MVP
- [x] `src/lib/ai/ads.ts`: `gerarBriefBasico()` + `gerarCopysAnuncio()` con 4 objetivos
- [x] Templates por objetivo: agendamentos, seguidores, promocao, recuperacao
- [x] Segmentación por categoría (9 categorías con intereses, edad, género)
- [x] Orçamento estimado (diario, total, CPC)
- [x] 5 dicas por campaña
- [x] UI completa: selector servicio + objetivo, generación, copy-to-clipboard
- [x] `Sidebar.tsx` actualizado con link "AI Ads"
- [x] Ruta `/painel/ads` activa

### 📦 NEXT (acciones manuales — usuario)
- [ ] `.env.production` con todos los secrets en Netlify UI
- [ ] DNS: `autonexabrasil.com.br` → Netlify
- [ ] Google OAuth consent screen → modo producción
- [ ] Meta App Review: templates `confirmacao_agendamento`, `lembrete_agendamento`, `convite_avaliacao`
- [ ] Alta piloto `bella-beleza` en producción (SQL en `docs/RUNBOOK.md`)
- [ ] Generar `og-image.png` 1200x630 para redes sociales

### 📦 Fase 8.7.2 COMPLETED (Dashboard analítico)

### 🆕 FASE 10 — POLISH & QUICK WINS (Agosto 2026)
- [x] **CTA nichos:** "outro" corregido — `cta_btn: "Fazer orçamento"` → `"Agendar horário"` (coherente con `hero_cta1`)
- [x] **Quick Win 1: Upsell Inteligente** — en el booking, al seleccionar un servicio, aparecen sugerencias inline de add-ons con quick-add chips (`ReservarClient.tsx`)
- [x] **Quick Win 2: Reagendamento automático** — al concluir un agendamento, se envía convite de reagendamento vía WhatsApp con link (`notificacoes.ts:enviarConviteReagendamento`, llamado desde `PATCH /api/agendamentos/[id]/status`)
- [x] **Quick Win 3: Alerta de abandono** — InsightCard detecta clientes sin agendar hace 60+ días y sugiere reaproximación (`InsightCard.tsx:clientesInativos`)
- [x] **Doc:** `docs/CICLOS_DEL_SISTEMA.md` — 7 ciclos actuales + 5 nuevos propuestos + roadmap de priorización
- [x] Build 70/70, typecheck limpio
- [x] Gráficos con `recharts`: faturamento mensal, taxa de ocupação — `DashboardCharts.tsx`
- [x] Métricas: faltas %, leads convertidos, ticket médio
- [x] Instalar `recharts`

### 🚀 DEPLOYMENT COMMANDS
```cmd
:: Development (port 3000)
npm run dev

:: Production on port 4999 (your proxy)
set PORT=4999 && npm run start

:: Full rebuild
rm -rf .next
npm run build
```

### 🧠 AGENT CONTEXT FOR NEXT SESSION
- **Working dir:** `D:\CCP\AUTOMATIZACURITIBA26`
- **Status:** PRODUCTION READY — Fases 0–9 ✅ + Dashboard analítico (Fase 8.7.2 ✅). Build 70/70 páginas, 0 errores.
- **Hosting:** Netlify (conectado via GitHub). Crons: `cron-lembretes` (12:00), `cron-vencidos` (03:00).
- **Color:** teal `#059669` (Tailwind `primary` variable)
- **Stack:** Next.js 16, React 19, Framer Motion, Supabase, Vitest
- **Docs:** `docs/PLAN_PRODUCCION.md` (9 fases, ~130/130 completados), `docs/RUNBOOK.md`, `docs/GO_LIVE.md`, `docs/CICLOS_DEL_SISTEMA.md` (7 ciclos + 5 nuevos propuestos)
- **Lo que falta:** Acciones manuales de go-live (DNS, env vars, OAuth, Meta Review).
- **NUEVO:** DashboardCharts con recharts (faturamento mensal, taxa de ocupação, faltas %, ticket médio, leads IA).