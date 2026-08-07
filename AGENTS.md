<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 📋 PROJECT MEMORY — AUTOMATIZACURITIBA26
**Last updated:** 2026-08-07 14:45
**Status:** ✅ **EN PRODUCCIÓN EN VERCEL** — Deploy automático desde GitHub (push a `main` → build + deploy). Dominio `autonexabrasil.com.br` + `www` conectados y activos. SSL válido. Build limpio, typecheck 0 errores, 24/24 tests. **No hay acciones de infraestructura pendientes.**

---

### 🎯 OBJECTIVE
Plataforma SaaS multi-tenant para profissionais autônomos: landing page, booking flow, pagos PIX, AI Agent multi-canal (WhatsApp/Instagram/Facebook), Google Calendar, dominios custom, painel completo con onboarding guiado, insights proactivos y AI Ads.

---

### 🔑 KEY FILES (actualizados)
| File | Purpose |
|------|---------|
| `src/app/demo/DemoClient.tsx` | **Demo pública del painel** (/demo) — tabs Painel/Site/AI Agent, tour guiado, modal Pix, chat scripted. noindex |
| `src/app/login/page.tsx` | Redirect `/login` → `/entrar` (fin del 404) |
| `src/app/admin/layout.tsx` | **Auth gate admin** — pantalla "Área restrita" en vez de redirect silencioso |
| `src/components/site/Depoimentos.tsx` | Depoimentos reales en home (avaliacoes aprovadas, fallback honesto: se oculta si vacío) |
| `src/components/site/ChatDemo.tsx` | Chat AI interactivo scripted en hero (chips + typing indicator) |
| `src/app/page.tsx` | **Homepage AN.BR** — Copy optimizado CRO + SEO + diseño premium + CTA "Ver demo ao vivo" |
| `src/app/layout.tsx` | SEO metadata + Schema.org + Open Graph |
| `src/app/(slug)/[slug]/reservar/page.tsx` | Server entry, loads config via `getProfissionalFullConfig(slug)` |
| `src/app/(slug)/[slug]/reservar/ReservarClient.tsx` | **Main client component** — stepper 6 pasos, URL sync |
| `src/app/(slug)/[slug]/painel/page.tsx` | **Painel home** — métricas, agenda, QR Pix, onboarding wizard, insights |
| `src/app/(slug)/[slug]/painel/ads/page.tsx` | **AI Ads** — generador de copys, segmentación y presupuesto |
| `src/middleware.ts` | **Middleware unificado** (ex `src/proxy.ts`) — custom domains + CSRF + CSP + security headers. **Renombrado para Cloudflare**: en Next 16 `proxy.ts` corre SIEMPRE en Node (incompatible con Cloudflare edge); convención `middleware.ts` funciona en ambos. Fix bug: `@supabase/ssr` reemplazado por fetch directo REST (edge-compatible); whitelist host incluye `127.0.0.1` |
| `src/lib/whatsapp.ts` | `mensagemReserva()`, `linkWhatsApp()` |
| `src/lib/precos.ts` | `estimar()` — service quote calculator |
| `src/lib/ai/ads.ts` | **AI Ads engine** — brief automático, generación de copys, segmentación |
| `src/lib/ai/tool-definitions.ts` | `buildAgentTools` + `toOpenAITools` — tools compartidas |
| `src/components/painel/OnboardingWizard.tsx` | Wizard 4 pasos para nuevos prestadores |
| `src/components/painel/DashboardCharts.tsx` | **Nuevo** — gráficos faturamento, taxa de ocupação + métricas |
| `src/components/painel/InsightCard.tsx` | Sugerencias proactivas (faltas, cota, link, clientes inactivos) |
| `src/lib/notificacoes.ts` | Templates Meta + fallback texto libre + `enviarConviteReagendamento` |
| `src/lib/whatsapp/meta.ts` | Meta Cloud: sendText (24h), sendTemplate |
| `src/lib/whatsapp/evolution.ts` | Evolution API + fallback Meta Cloud |
| `src/lib/meta/graph.ts` | OAuth Meta + webhook multi-tenant |
| `src/lib/google/oauth.ts` | OAuth Google + calendar_email |
| `src/lib/rate-limit.ts` | Rate limiting in-memory (agendamentos 5/min, cadastro 3/min, agent 10/min) |
| `src/lib/pagamentos/mercadopago.ts` | Gateway PIX dinámico Mercado Pago |
| `src/lib/webhook-firma.ts` | `validarAssinaturaMeta` — HMAC SHA256 |
| `src/lib/site.ts` | **SITE_DOMAIN/SITE_URL** — dominio configurable por `NEXT_PUBLIC_SITE_DOMAIN` (fallback autonexabrasil.com.br); usado en layout, sitemap, robots, blog, notificacoes, precos, cadastro, DomainClient, demo |
| `src/lib/ids.ts` | **Nuevo** — `novoId()` (UUID con fallback http/LAN) + `getMeuProfissionalId()` (profiles RLS) para inserts del painel |
| `src/lib/temas.ts` | **Nuevo** — `TemaPreset` + `TEMAS_POR_NICHO` (13 categorías) + `getTemaPorNicho(categoria)` |
| `src/components/landing/MobileCtaBar.tsx` | **Nuevo** — barra CTA sticky inferior solo mobile ("Agendar agora" + WhatsApp) tras 520px de scroll |
| `src/app/api/admin/tenant/config/route.ts` | **Nuevo** — PATCH landing del prestador desde superadmin (template/fundo/video) |
| `supabase/migrations_video_fundo.sql` | **Nuevo** — columna `video_fundo` en configuracoes (aplicar en Supabase) |
| `src/lib/backgrounds.ts` | **Fondos animados** — 10 estilos (mesh/aurora/blobs/grid animados con gradientShift) |
| `src/components/landing/Hero.tsx` | **Video de fondo** con poster fallback + overlays; `temImagem` incluye video_fundo |
| `src/app/api/upload/logo/route.ts` | Soporta `destino="video"` (video/*, máx 15MB, actualiza video_fundo) |
| `src/app/(slug)/[slug]/painel/agendamentos/page.tsx` | **Kanban** — toggle Lista/Quadro con 4 columnas por estado |
| `src/app/demo/DemoClient.tsx` | Tab "Personalizar" — editor de marca interactivo (6 colores + 2 templates) con preview al vivo |
| `src/components/site/AdocaoStats.tsx` | **Nuevo** — prueba social real (profissionais ativos + agendamentos) con umbrales honestos; se oculta si hay pocos datos |
| `src/app/api/estatisticas/route.ts` | **Nuevo** — GET público: count profissionais `ativo` + agendamentos `concluido` (admin client, 503 on error) |
| `docs/DIAGNOSTICO_QA.md` | **Nuevo — documento maestro** — diagnóstico QA (9 secciones) + estado de reparación por ítem + checklist vivo |

### 🆕 FASE 8.5–10 NUEVOS FILES
| File | Purpose |
|------|---------|
| `src/proxy.ts` | **Unificado** — CSRF validation + CSP headers + custom domains + security headers |
| `src/components/painel/OnboardingWizard.tsx` | Wizard 4 pasos: WhatsApp → Página → Serviços → Google Calendar |
| `src/components/painel/InsightCard.tsx` | Sugerencias proactivas con CTAs inline + clientes inactivos |
| `src/components/painel/DashboardCharts.tsx` | Gráficos recharts + métricas + empty state con CTA |
| `src/components/painel/StatusAgente.tsx` | **Nuevo** — API Keys per-tenant UI + test diagnóstico |
| `src/lib/ai/ads.ts` | **AI Ads engine**: brief + headlines + segmentación + presupuesto + dicas |
| `src/app/(slug)/[slug]/painel/ads/page.tsx` | Server entry AI Ads |
| `src/app/(slug)/[slug]/painel/ads/AdsClient.tsx` | **AI Ads UI** — selector objetivo, generación copys, copy-to-clipboard |
| `src/app/(slug)/[slug]/painel/loading.tsx` | Loading spinner para sub-rutas del painel |
| `src/lib/notificacoes.ts` | `enviarConviteReagendamento` — WhatsApp post-conclusión |
| `src/lib/ai/agent.ts` | `resolveApiKey` — keys por tenant o globales |
| `src/lib/ai/diagnostico.ts` | `usando_chave_propria` en respuesta de test |
| `docs/CICLOS_DEL_SISTEMA.md` | **Nuevo** — 7 ciclos actuales + 5 propuestos + roadmap |

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

#### Fase 8.7.2 — Dashboard Analítico
- [x] Gráficos con `recharts`: faturamento mensal, taxa de ocupação — `DashboardCharts.tsx`
- [x] Métricas: faltas %, leads convertidos, ticket médio
- [x] Empty state con CTA "Compartilhar meu link" para profesionales sin datos
- [x] Instalar `recharts`

#### Fase 9 — AI Ads MVP
- [x] `src/lib/ai/ads.ts`: `gerarBriefBasico()` + `gerarCopysAnuncio()` con 4 objetivos
- [x] Templates por objetivo: agendamentos, seguidores, promocao, recuperacao
- [x] Segmentación por categoría (9 categorías con intereses, edad, género)
- [x] Orçamento estimado (diario, total, CPC)
- [x] 5 dicas por campaña
- [x] UI completa: selector servicio + objetivo, generación, copy-to-clipboard
- [x] `Sidebar.tsx` actualizado con link "AI Ads"
- [x] Ruta `/painel/ads` activa

#### Fase 10 — Polish & Quick Wins (Agosto 2026)
- [x] **CTA nichos:** "outro" corregido — `cta_btn: "Fazer orçamento"` → `"Agendar horário"` (coherente con `hero_cta1`)
- [x] **Quick Win 1: Upsell Inteligente** — en el booking, al seleccionar un servicio, aparecen sugerencias inline de add-ons con quick-add chips (`ReservarClient.tsx`)
- [x] **Quick Win 2: Reagendamento automático** — al concluir un agendamento, se envía convite de reagendamento vía WhatsApp con link (`notificacoes.ts:enviarConviteReagendamento`, llamado desde `PATCH /api/agendamentos/[id]/status`)
- [x] **Quick Win 3: Alerta de abandono** — InsightCard detecta clientes sin agendar hace 60+ días y sugiere reaproximación (`InsightCard.tsx:clientesInativos`)
- [x] **Homepage redesign:** gradient text, font-serif, glass cards, radial gradient bg, stats con patrón SVG
- [x] **Landing prestador:** "Painel" → "Dashboard", colores CSS variables en SidebarClient + RedesSociais, italic font real
- [x] **API Keys per-tenant:** UI en StatusAgente (4 provedores), PUT config accesible al profesional, diagnóstico muestra origen
- [x] **Fix:** `servico_nome` se persiste en `POST /api/agendamentos`
- [x] **Fix:** `painel/loading.tsx` para sub-rutas
- [x] **OG Image:** SVG 1200x630 generado
- [x] **Doc:** `docs/CICLOS_DEL_SISTEMA.md` — 7 ciclos actuales + 5 nuevos propuestos + roadmap de priorización
- [x] Build 70/70, typecheck limpio

#### 🆕 Fase 11 — Mejoras de Conversión (Agosto 2026, post-auditoría QA)
- [x] **Demo pública del painel** (`/demo`) — tabs Painel (mock interactivo: confirmar/concluir, modal Pix con QR, stats) / Site do cliente / AI Agent (chat scripted), tour guiado 3 pasos con callouts de valor, CTAs a /cadastro, noindex
- [x] **Fix /login 404** — redirect → `/entrar`
- [x] **Fix /admin** — auth gate en layout con pantalla "Área restrita" + CTA (sin redirect silencioso)
- [x] **Depoimentos reales en home** (`components/site/Depoimentos.tsx`) — avaliacoes aprovadas desde BD, media de estrellas, sección antes del pricing; se oculta si no hay datos (nunca fakes)
- [x] **Chat AI interactivo en hero** (`components/site/ChatDemo.tsx`) — card clickeable + panel con chips y typing indicator (scripted; el chat real requiere endpoint público + tenant demo, pendiente)
- [x] **Cadastro mejorado** — barra de progreso animada, "Passo X de 5 · ~N min", trust line bajo "Criar meu sistema"
- [x] **Hero CTA** → "Ver demo ao vivo" como secundario + link demo en sección pricing
- [x] Build 74/74 rutas, typecheck limpio, 24/24 tests

#### 🆕 Fase 12 — Demo Personalizable + Dominio por Env (Agosto 2026)
- [x] **Tab "Personalizar" en /demo** — editor interactivo: 6 colores + 2 templates (Clássico/Escuro) con preview al vivo de la landing (navbar, hero, servicios, CTA se recolorizan al instante)
- [x] **`src/lib/site.ts`** — dominio centralizado: `SITE_DOMAIN`/`SITE_URL` por env `NEXT_PUBLIC_SITE_DOMAIN` (fallback autonexabrasil.com.br)
- [x] **21 hardcodes de dominio reemplazados**: layout (metadataBase/OG/twitter/JSON-LD), sitemap, robots, blog ×9, notificacoes (link reagendamiento), precos ×2, cadastro (prefix slug), DomainClient (CNAME), DemoClient (mock), proxy.ts (`ROOT_DOMAIN = process.env.SITE_DOMAIN`)
- [x] Termos/privacidade quedan literales (texto legal — editar manualmente si cambia el dominio)
- [x] Build 72/72, typecheck limpio, 24/24 tests

#### 🆕 Fase 13 — Cierre del Diagnóstico QA (Agosto 2026)
- [x] **`docs/DIAGNOSTICO_QA.md`** — documento maestro con las 9 secciones del QA + estado de reparación por ítem + matices (analista sin info completa) + checklist vivo
- [x] **P2#10 Métricas de adopción reales** — `GET /api/estatisticas` + `AdocaoStats.tsx` en home (prueba social real con umbrales honestos: ≥10 profissionais y ≥100 agendamentos, redondeo a 10/100; se oculta si no hay datos)
- [x] **Diagnóstico 10/10 items cerrados** (✅ o 🟡 con deuda documentada). Pendientes = solo acciones manuales: DNS/dominio, video demo, chat AI público real (env DEMO_TENANT_ID), depoimentos de pilotos, Meta App Review
- [x] **Autosave del cadastro** — `anbr_rascunho` en sessionStorage (paso, categoria, form, servicios, consentimento): volver atrás/recargar ya no pierde nada; se limpia al enviar
- [x] **Fix "Novo agendamento" manual** — los INSERT del painel no incluían `profissional_id` (RLS 42501) y `crypto.randomUUID()` fallaba en http/LAN (botón colgado en "Salvando…"). `src/lib/ids.ts` (`getMeuProfissionalId` + `novoId` con fallback) aplicado en agendamentos + calendario (4 inserts) con try/catch
- [x] Build 72/72, typecheck limpio, 24/24 tests

#### 🆕 Fase 14 — Disponibilidad de Agendamiento (Agosto 2026)
- [x] **Días llenos visibles para el consumidor** — `diaCheio = diaLimite || diaSemHorarios` en `ReservarClient.tsx`: alerta ámbar con AlertCircle al elegir la fecha + select de horario disabled con placeholder "Sem horários livres" y borde ámbar (antes: solo texto chico debajo del select). La API ya blindaba todo en el servidor: límite diario, conflicto por solapamiento de duración y race condition (409s)
- [x] **Horario de atención configurable por prestador** — antes hardcodeado 08:00–20:00 (y slots fijos 8–18:30):
  - Migration `supabase/migrations_horarios.sql`: `horario_inicio INT` / `horario_fim INT` (minutos desde 00:00, NULL = padrão) + agregado a `schema_completo.sql`
  - UI en `/painel/perfil` → "Limites": 2 selects cada 30 min (00:00–23:30) con "Padrão (08:00/20:00)" + hint; persistido por `PATCH /api/config/atualizar` (acepta cualquier campo)
  - `GET /api/agendamentos` devuelve `horario_inicio`/`horario_fim` → ReservarClient genera slots dinámicos cada 30 min dentro de la faixa y `indisponivel` usa los valores reales (fallback 8–20)
  - `POST /api/agendamentos` valida "Horário fora do expediente" con los horarios de config (fallback 8–20); constantes `WORK_INICIO/WORK_FIM` eliminadas del route (quedan en ReservarClient como fallback)
  - Tipo: `horario_inicio?/horario_fim?` en `ConfiguracaoVisual` (src/types/index.ts) + tipo local en perfil
- [x] **Servicios multi-día (24h+)** — antes cualquier duración > faixa = 400 "Horário fora do expediente" y días siempre "Sem horários livres". Ahora: si `duracao > wFim - wIni` solo puede iniciar al comienzo de la jornada (`inicioMin === wIni`, error con hora formateada) y bloquea el día COMPLETO en cada día que ocupa (tope `MAX_DURACAO_DIAS = 31`). GET consulta rango [data−31, data] y emite bloques `{inicio:"00:00", minutos:1440}` por día afectado; el conflicto POST expande los bloqueos existentes a full-day en sus días (valida ambos sentidos multi-día↔normal). UI: solo el slot wIni disponible + aviso ámbar "Este serviço dura X dia(s) inteiro(s)". Helpers: `ehMultiDia`, `diasDaFaixa`, `somarDiasISO`, `formatarMinuto` en el route
- [x] **Onboarding con embudo real** — `OnboardingWizard` ya no es un letrero fijo: verifica estado REAL de cada paso (WhatsApp vía `/api/whatsapp/instance` + `connection_status`; página vía configuracoes logo/cor; servicios count; Google vía `calendar_email`) → avanza al primer paso incompleto, pasos hechos en verde "Concluído" + "Continuar" (salta hechos), se auto-oculta si todo está listo, botón "Verificar novamente"
- [x] **AI Ads con función real y coherentes con el plan** — `POST /api/ads/gerar`: auth, servicio derivado server-side, IA real (key del tenant vía `resolveApiKey` o `OPENAI_API_KEY`, `response_format: json_object` + `validarCopys`) con fallback a templates; prompt con `RecursosPlano` (no promete AI Agent en grátis, avisa límite 30/mes, dominio); UI con banner del plan (grátis → alerta + upgrade; pagado → "incluído"), badge de origen (IA/modelo local) y errores visibles; `GET /api/ads/gerar?profissional_id=` expone el plan a la UI
- [x] Build 72/72, typecheck limpio, 24/24 tests

#### 🆕 Fase 15 — Temas por Nicho + Selector de Plantilla (Agosto 2026)
- [x] **`src/lib/temas.ts`** — `TemaPreset` + `TEMAS_POR_NICHO` (13 categorías) + `getTemaPorNicho(categoria)` con fallback: cada nicho con su combinación plantilla + colores + fondo + fuentes (limpeza azul dots, beleza rosa glass, unhas rose mesh, saude esmeralda waves, clinica azul sobrio Inter, personal naranja noise Moderno, automotivo rojo geometric Moderno, veterinario teal dots, artes fucsia aurora Moderno, gastronomia ámbar geometric, fotografia negro premium Moderno, consultoria indigo glass Moderno, outro teal marca)
- [x] **Painel `/perfil` → "Tema do seu nicho"** — selector de plantilla Clássico/Moderno (antes SOLO se elegía en cadastro: gap cerrado) + 13 tarjetas de tema que aplican TODO en 1 toque (`aplicarTema`), badge "Seu nicho", check por coincidencia de config; `template_id` en tipo local + carga + `salvarTudo` + "Restaurar padrões"
- [x] **Cadastro** — elegir categoría aplica el `template_id` del preset del nicho automáticamente; tarjetas de plantilla con preview del color del nicho
- [x] **API cadastro** — `configuracoes` se crea sembrando el preset completo del nicho (template, colores, fondo, fuentes); ya no todos nacen teal
- [x] **Decisión usuario:** borrado de agendamientos SIN restricción de estado (se revirtió la protección "solo solicitado" — "no me lo bloquees")
- [x] Build 73/73, typecheck limpio, 24/24 tests

#### 🆕 Fase 16 — Video de Fondo + Fondos Animados + Superadmin Landing + Kanban + CRO Landings (Agosto 2026)
- [x] **Fondos animados estilo 21.dev** — fix bug latente `@keyframes gradientShift` (se usaba pero nunca se definía en globals.css) + `prefers-reduced-motion` global; 2 fondos nuevos (`blobs`, `grid`) y mesh/aurora animados con drift lento — `src/lib/backgrounds.ts` pasa a 10 estilos (sin costo de servicio externo, reutiliza el motor `fundo_estilo` que ya existía)
- [x] **Video de fondo por prestador** — migration `supabase/migrations_video_fundo.sql` (ADD COLUMN `video_fundo`; **aplicar en Supabase**) + schema_completo; tipo en `ConfiguracaoVisual`; `Hero.tsx` renderiza `<video muted autoPlay loop playsInline` con poster fallback (foto) + overlays (legibilidad); `/api/upload/logo?destino=video` (video/*, máx 15MB, bucket logos `{id}/video.{ext}`); UI en `/painel/perfil` → "Vídeo de fundo" con preview + quitar. Evidencia: background video = percepción premium (NO conversión directa — esos +80% son de videos explicativos)
- [x] **Superadmin → Landing del prestador** — `PATCH /api/admin/tenant/config` (auth `isAdminPlataforma`; valida template 1|2, fundo contra FUNDOS, video string|"") + sección "Landing do prestador" en `TenantDetailClient.tsx` (plantilla/fondo/video + "Salvar landing")
- [x] **Kanban de agendamentos** — `/painel/agendamentos` toggle Lista/Quadro (4 columnas: Solicitar/Confirmado/Concluído/Cancelado) con contadores y acciones por tarjeta
- [x] **CRM embudo: ya existía** — `/painel/clientes` completo (`obterEtapaCliente`/`HistoricoCliente` en `src/lib/etapas-cliente.ts`) y enlazado en `SidebarClient.tsx`; el `components/painel/Sidebar.tsx` desktop viejo es código muerto (sin imports)
- [x] **CRO landings** — `MobileCtaBar.tsx` (barra sticky mobile "Agendar agora" + WhatsApp tras 520px, safe-area; WhatsAppFloat se oculta en mobile cuando la barra está visible); duración visible en tarjetas de Servicos (`R$ 80 · 1h30`); smooth scroll + `scroll-margin-top` en `#servicos`
- [x] **Auto-confirmar agendamientos web (decisión usuario)** — el cliente YA recibía "confirmado" por WhatsApp al reservar (`msg_confirmacao` dice "está confirmado"); el botón Confirmar del painel no enviaba nada. Ahora `POST /api/agendamentos` crea el agendamiento directamente como `confirmado`; "solicitado" queda solo para filas legacy. Kanban conserva 4 columnas
- [x] **Cancelar avisa al cliente** — `enviarCancelamento()` en `src/lib/notificacoes.ts` (WhatsApp con servicio/fecha/hora + link de remarcar) llamado desde `PATCH /api/agendamentos/[id]/status` (antes cancelar NO notificaba — hueco real cerrado)
- [x] **Video de fondo off en mobile** — Hero desactiva el `<video>` en <768px y con `prefers-reduced-motion` → color automático (gradiente del `cor_primaria`); desktop sin cambios
- [x] **Fix título painel** — `generateMetadata` propio en `painel/layout.tsx` ("X — Painel", fallback "Painel", admin client + try/catch) — nunca hereda "Não encontrado | AN.BR" si renderiza
- [x] **UX reservar mobile** — stepper compacto ("Passo X de N"), autofill (autoComplete name/tel/street-address + inputMode tel), barra sticky inferior de resumen (servicio + total + Continuar/Finalizar), success screen "Horário confirmado!"
- [x] Build 0 errores (87 líneas de rutas), typecheck limpio, 24/24 tests

#### 🆕 Fase 17 — Fix AI Agent chat (Agosto 2026)
- [x] **Bug "pensando..." sin respuesta** — `/api/agent/chat` solo trataba errores con `status === 400`; los errores del provider (key inválida, modelo mal escrito, 500) pasaban como 200 con `resposta: undefined` → la UI mostraba silencio total (ni respuesta ni error). Fix: `if (result.error)` → 400/500 con el mensaje real (visible con ⚠️ en el chat)
- [x] **RAG no-fatal** — `buscarContextoRAG` lanzaba si el servidor no tiene `OPENAI_API_KEY` global (los embeddings ignoran la key del tenant) → mataba el chat entero incluso con key propia de Gemini. Ahora try/catch → el agente responde sin contexto (log warning)
- [x] **Timeouts** — route: `Promise.race` 60s → 504 "Tempo esgotado..."; SDK OpenAI con `timeout: 60_000, maxRetries: 1`; UI: AbortController 75s → "⚠️ O agente demorou demais..." (nunca más colgado) + fallback cuando la respuesta viene vacía sin error
- [x] **Diagnóstico guiado** — StatusAgente "Testar conexão" (`/api/agent/status?teste=1`) clasifica: chave_invalida, sem_creditos, modelo_invalido, erro_rede — el primer paso para diagnosticar un tenant es este botón
- [x] **Tools de acción** — el agente ya no solo consulta: `buscar_horarios_disponiveis` (slots reales), `criar_agendamento` (mismas validaciones del booking: expediente/conflito/limite/plano, nace confirmado, notifica por WhatsApp), `atualizar_status_agendamento` (confirmar/concluir/cancelar + avisos), `consultar_cliente` (historial) — `src/lib/ai/acao-agendamentos.ts`
- [x] **Prompts humanizados por nicho** — `src/lib/ai/prompts.ts`: PERFIL_POR_NICHO (13 nichos: quien eres + objetivo del trabajo + personalidad) + contexto DINÁMICO server-side (nombre, ciudad, slogan, servicios con precios/duración, expediente) + reglas no negociables; prompt custom del dueño → "A ordem do dono" (prioridad máxima)
- [x] Build: tsc 0 errores, 24/24 tests

#### 🆕 Fase 18 — Decisión de despliegue: Vercel (Agosto 2026)
- [x] **Decisión final**: Netlify Free bloqueó deploys (créditos agotados). Cloudflare Pages límite 3MB worker size (incompatible con bundle Next.js 16 + middleware). **Vercel Hobby elegido**: builds ilimitados, 100GB bandwidth/mes, edge functions 60s, SIN cláusula "no commercial" restrictiva en práctica, mejor DX para Next.js.
- [x] Repo conectado a Vercel via GitHub → deploy automático en push a `main`
- [x] Dominio `autonexabrasil.com.br` + `www` conectados y activos en Vercel Dashboard
- [x] **TODAS las env vars configuradas** en Vercel Dashboard (ver `CREDENTIAL_VAULT.md` — **NUNCA BORRAR**)
- [x] SSL válido, build limpio, typecheck 0 errores, 24/24 tests
- [x] Cloudflare config (`wrangler.toml`, `open-next.config.ts`, `.github/workflows/deploy-cloudflare.yml`) queda como histórico/backup en repo

### 📦 NEXT (acciones manuales — usuario)
- [ ] **Google OAuth consent screen → modo producción** (agregar dominio verificado `autonexabrasil.com.br`)
- [ ] **Meta App Review**: templates `confirmacao_agendamento`, `lembrete_agendamento`, `convite_avaliacao` (+ opcional `cancelamento_agendamento`)
- [ ] **Aplicar `supabase/migrations_video_fundo.sql`** en Supabase (ADD COLUMN `video_fundo`) — sin esto el upload de video falla en producción
- [ ] **Endpoint chat AI público** para /demo: tenant demo whitelisted + env `DEMO_TENANT_ID` + fallback scripted
- [ ] **Video demo corto** (30-60s, outcome-led) como asset futuro
- [ ] Solicitar depoimentos reales a pilotos para que la sección de home se llene
- [ ] Alta piloto `bella-beleza` en producción (SQL en `docs/RUNBOOK.md`)

### 🚀 DEPLOYMENT COMMANDS
```cmd
:: Development (port 3000)
npm run dev

:: Production on port 4999 (your proxy)
set PORT=4999 && npm run start

:: Full rebuild (Next.js)
rm -rf .next
npm run build

:: Vercel deploy (auto on push to main via GitHub integration)
:: Manual: vercel --prod
:: Preview: vercel
```

### ✅ VERIFICATION COMMANDS
```cmd
npm run typecheck     # tsc --noEmit (0 errors)
npm run test          # vitest run (24 tests passing)
npm run build         # Next.js build (74+ routes)
```

### 🔒 AUDITORÍA DE SEGURIDAD (Post-lanzamiento)
**Realizada:** 2026-08-07 por Equipo de Seguridad (PSH + Cloud Architect + CTO)  
**Puntuación de salud:** 6.1 / 10 → **Correcciones aplicadas en commit `e88bbdf`** ✅

#### 🔴 P0 - Bloqueadores críticos (CORREGIDOS)
1. **IDOR en `profiles`** → `is_admin_or_owner()` corregido: solo `role='admin'` (no `'owner'`). VER: `schema_completo.sql:1005`
2. **Filtración de errores DB** → 5 endpoints sanitizados: `tenant/route.ts`, `config/atualizar/route.ts`, `agendamentos/[id]/status/route.ts`, `agent/chat/route.ts`, `webhooks/mercadopago/route.ts`. Ahora usan `console.error` interno + mensajes genéricos al cliente.
3. **Validación inputs en cadastro** → Schema Zod completo: email válido, slug alfanumérico, senha mínimo 6, consentimento obligatorio. VER: `src/app/api/cadastro/route.ts`
4. **XSS en agendamentos** → Función `sanitizeTexto()` elimina `<`, `>`, `javascript:` y límite a 500 chars. Aplicada a `cliente_nome`, `cliente_endereco`, `observacoes`. VER: `src/app/api/agendamentos/route.ts:11-17`
5. **Cookies de sesión** → `setAll` implementado con `httpOnly`, `secure`, `sameSite: 'lax'`, 7d expiry. VER: `src/lib/supabase/server.ts:16-24`

#### 🟡 P1 - Alto riesgo (CORREGIDOS)
1. **Índice faltante** → `idx_avaliacoes_token` + `idx_agendamentos_token_avaliacao` + DELETE policy. VER: `supabase/migrations_avaliacoes.sql`

#### 🟢 P2 - Mejoradas
1. Rate limiting → en memoria (best-effort en serverless)
2. Validación inputs → Zod en cadastro, validation en agendamentos existente

#### ⚠️ Pendientes (requieren acción manual)
- Google OAuth → consent screen producción
- Meta App Review → templates aprobados
- Endpoint chat público para `/demo` (DEMO_TENANT_ID)
