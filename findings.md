# Findings & Decisions — AN.BR Mejoras de Conversión

## Requirements
- Demo pública del painel (P0) — atacar la barrera de conversión principal
- Fix rutas `/login` (404) y `/admin` (redirect silencioso) (P0)
- Depoimentos reales en home (P1)
- Mejora de `/cadastro` con progreso visual (P1)
- Chat AI funcional en home (P2)
- Usar skills (instalar si hace falta) + investigar mejores prácticas
- Documento vivo que se actualice constantemente

## Research Findings

### Demos interactivas de producto (websearch 2026-08-06)
- Demos interactivas convierten ~8x mejor que demos genéricas (userpilot.com)
- Regla de oro: **UN solo workflow, un resultado, un siguiente paso** — no mostrar todo el producto (maybeundo.com, levelupdemo.com)
- Estructura: inicio (contexto/problema) → medio (workflow) → final (outcome + CTA claro)
- Empezar por el outcome de negocio, no por un tour de features (arcade.software)
- Callouts breves que expliquen VALOR, no movimiento
- Completables en pocos minutos; analytics de completación
- Aplicado a AN.BR: la demo del painel = 1 flujo (dashboard: métricas + agenda + AI Agent) con callouts y CTA final a /cadastro. NO replicar todo el painel (14 sub-rutas).

### Social proof / testimonios (websearch 2026-08-06)
- Colocación > volumen: la mejor colocación es **debajo del hero o cerca del CTA**, no al pie de página (moydus.com, foundey.com)
- 2-3 testimonios específicos y atribuidos superan una pared genérica (provesrc.com)
- Atribución completa (nombre, foto, rol) convierte más (alexberman.com)
- Cifras específicas > elogios genéricos
- Social proof puede +34% conversión; cerca del CTA es de mayor apalancamiento
- Aplicado a AN.BR: sección depoimentos ANTES de pricing (decisión point) + 1 testimonio cerca del CTA final

### Datos técnicos del proyecto (validado en código)
- `avaliacoes` (migrations_avaliacoes.sql): RLS público de SELECT solo con `aprovada = true`; campos cliente_nome, nota (1-5), texto, created_at, profissional_id. Join con profissionais viable (RLS pública existe para landing).
- Seed demo real: slug `caridad-teste` (limpeza). El commit 9e28c8a menciona 13 nichos con templates (probablemente en otro seed/migración).
- `/api/agent/chat` existe para chat AI; requiere config de agente del tenant.

### Dominio hardcodeado (hallazgo Phase 8, 2026-08-06)
- 26 usos de `autonexabrasil.com.br` en src/ (grep). Clasificados en 3 grupos:
  - **Funcionales/SEO (21) → centralizados** en `src/lib/site.ts` (`SITE_DOMAIN`/`SITE_URL` por `NEXT_PUBLIC_SITE_DOMAIN`, fallback autonexabrasil.com.br): layout.tsx (metadataBase/OG/twitter/JSON-LD), sitemap.ts, robots.ts, blog (9), notificacoes.ts (link reagendamiento WhatsApp), precos (2), cadastro (prefix slug), DomainClient (CNAME), DemoClient (mock), proxy.ts (ROOT_DOMAIN → `process.env.SITE_DOMAIN` runtime, edge).
  - **Legales → literales a propósito**: termos y privacidade (definen la plataforma por su dominio oficial; si cambia el dominio hay que editar el texto legal, no el env).
  - **Ya env-driven**: manifest.webmanifest (NEXT_PUBLIC_DOMAIN).
- Decisión P0-2 resuelta en código: cuando se decida la marca/dominio final (AN.BR vs AutoNexaBrasil), solo hay que fijar 1 env var en el build; proxy usa SITE_DOMAIN runtime.
- Lección: ediciones por bloque con líneas repetidas (url + inLanguage + publisher en JSON-LD) pueden duplicar nodos → verificar con tsc tras cada batch de edits.

### Cierre del diagnóstico (Phase 9, 2026-08-06)
- **Documento maestro**: `docs/DIAGNOSTICO_QA.md` — las 9 secciones del QA original + matriz de estado por ítem + matices donde el analista no tenía toda la info. Es EL documento a actualizar.
- **P2#9 (Planos)**: ya existía completo en `/precos` (3 planes, comparativa feature-by-feature línea 319, FAQ) y home → el analista no scrolleó.
- **P2#10 (métricas de impacto)**: stats bar (5min/30/40%/24h) existía; faltaba adopción real. Nuevo: `GET /api/estatisticas` (cuenta profissionais `status='ativo'` + agendamentos `status='concluido'`, admin client, 503 on error) + `AdocaoStats.tsx` (client, fetch, umbrales honestos: se muestra solo si ≥10 profissionais y ≥100 agendamentos; números redondeados a 10/100). GET no pasa por CSRF del proxy (solo POST/PATCH/DELETE) → sin cambios en proxy.
- **Estado final**: los 10 ítems del diagnóstico quedan en ✅ o 🟡-con-deuda-documentada (chat real público + video + DNS = acciones manuales).

### Disponibilidad de agendamiento (Phase 9.3, 2026-08-06)
- **La disponibilidad estaba blindada en 2 capas desde el inicio**: (1) UI — GET /api/agendamentos devuelve slots ocupados con duración → options disabled en el select; (2) servidor — POST valida límite diario (409 "limite"), conflicto por SOLAPAMIENTO de duración (409 "já foi reservado") y race condition vía constraint unique (409 "acabou de ser reservado").
- **Gap visual encontrado**: el día lleno solo se notaba como texto chico debajo del select (o ni eso con límite diario). Ahora: alerta ámbar inmediata al elegir fecha + select disabled "Sem horários livres" con borde ámbar (`diaCheio = diaLimite || diaSemHorarios`).
- **Gap de configuración**: el horario de trabajo estaba hardcodeado (08:00–20:00) en ReservarClient + API, y los slots se generaban con loop fijo 8–18:30 (nunca se usaban las 20h). Ahora: `horario_inicio`/`horario_fim` en `configuracoes` (INT minutos, NULL = padrão), editables en /painel/perfil → Limites, devueltos por GET y validados en POST (fallback 8*60/20*60). Slots generados cada 30 min dentro de la faixa (antes: 08:00–18:30).
- Nota: el painel (calendario/agendamentos) ya mostraba el espejo exacto de ocupación; solo faltaba la configuración de la faixa.

### Servicios multi-día 24h+ (Phase 9.4, 2026-08-06)
- **Antes**: cualquier servicio con duración > faixa diaria (default 12h) era imposible: POST → 400 "Horário fora do expediente" (inicio+duracao > wFim) y en la UI ningún slot pasaba `indisponivel` → "Sem horários livres" todos los días. El conflicto solo miraba el mismo día (`eq(data)`), así que un servicio que cruza medianoche ni siquiera bloqueaba el día siguiente.
- **Semántica elegida** (usuario): servicio multi-día solo puede INICIAR al comienzo de la jornada (wIni) y bloquea el DÍA COMPLETO en cada día que ocupa (00:00–1440). Simplicidad > precisión parcial.
- **Implementación** (todo en api/agendamentos/route.ts + ReservarClient):
  - `ehMultiDia = duracao > wFim - wIni`; `diasDaFaixa` = ceil((inicioMin+duracao)/1440) días desde el inicio; tope 31 días.
  - GET consulta rango [data−31, data] (un multi-día empezado hace 3 días afecta hoy) y emite bloque full-day por día afectado.
  - POST exige `inicioMin === wIni` para multi-día (error con la hora formateada), y el conflicto expande TODOS los bloques existentes a full-day en sus días → se impide tanto nuevo multi-día vs cualquier ocupación como ocupación normal vs multi-día previo.
  - Race condition: unique index (profissional_id, data, hora) sigue cubriendo dos multi-días con el mismo inicio.
- UI: solo el slot wIni aparece como disponible + aviso ámbar con icono Info ("Este serviço dura X dia(s) inteiro(s) — só pode iniciar às HH:MM").

### Onboarding con embudo real + AI Ads con función (Phase 9.5, 2026-08-06)
- **Problema reportado por el usuario**: el paso 1 del onboarding ("Conecte seu WhatsApp... Configurar WhatsApp / Já fiz isso") era un letrero fijo sin relación con la realidad, y el AI Ads era decorativo (generador de templates con 600ms falsos, sin relación con el plan del profesional).
- **OnboardingWizard**: ahora verifica estado real de cada paso y actúa como embudo:
  - WhatsApp: `/api/whatsapp/instance` → `configured && connection_status ∈ [connected, open, active]` (mismo criterio que diagnóstico.ts)
  - Página: configuracoes (logo_url no vacío o cor_primaria ≠ default #059669) · Serviços: count ativo > 0 · Google: profissionais.calendar_email
  - Avanza al PRIMER paso incompleto (incluso sobre el valor guardado en localStorage); completados → verde "Concluído" + botón "Continuar" que salta pasos hechos; si todo está hecho se auto-oculta y persiste storage=completo; barra de progreso = % de pasos reales; "Verificar novamente" re-consulta.
  - Nota: si el profesional nunca personalizó colores/logo, el paso "Página" seguirá pendiente aunque el resto esté hecho — comportamiento deseado (embudo de activación).
- **AI Ads real**: nuevo `POST /api/ads/gerar` (auth verificarAcessoProfissional; servicio derivado server-side por servico_id — nunca del cliente; plan via getPlanoAtivo). Llama IA real con la key del tenant (`resolveApiKey` + model del agent_configs) o `OPENAI_API_KEY` del servidor, `response_format: json_object` + `validarCopys()` (fallback a templates si JSON inválido o error de red).
  - **Coherencia con el plan**: `RecursosPlano` en el system prompt (agente 24h solo si profesional/ia_premium; sin claims de respuesta automática en grátis; límite 30/mes avisado). Templates: dica de límite para grátis con link a /painel/plano; dica de respuesta manual si no hay AI Agent.
  - UI: banner de plan (grátis → ámbar con alerta de límite + CTA "Fazer upgrade"; pagado → teal "Recurso incluído no seu plano X"), badge de origen ("Gerado com IA · gpt-4o-mini" / "Modelo local — configure sua chave de IA"), errores visibles, sin delay falso.
  - `GET /api/ads/gerar?profissional_id=` expone el estado del plan a la UI (cliente no tiene acceso a getPlanoAtivo).

### Temas por nicho + selector de plantilla en el painel (Phase 9.6, 2026-08-06)
- **Problema reportado por el usuario**: las landings difieren mucho por nicho y servicios, pero todos los prestadores nacían con el mismo tema predefinido (Clássico teal) y la plantilla visual SOLO se elegía en el cadastro (el painel no permitía cambiarla).
- **Presets curados por nicho** (`src/lib/temas.ts`): 13 temas (uno por categoría) que combinan plantilla + colores + fondo + fuentes con coherencia emocional: limpeza → azul confiable con dots; beleza → rosa elegante glass; unhas → rose mesh; saude → esmeralda waves; clinica → azul sobrio (Inter); personal → naranja noise (Moderno); automotivo → rojo geometric (Moderno); veterinario → teal dots; artes → fucsia aurora (Moderno); gastronomia → ámbar geometric; fotografia → negro premium (Moderno); consultoria → indigo glass (Moderno); outro → teal de marca.
- **En el painel** (perfil → "Tema do seu nicho"): selector de plantilla Clássico/Moderno (cierra el gap de que solo se elegía en cadastro) + 13 tarjetas que aplican el tema completo en 1 toque (sin bloquear ajustes manuales posteriores); badge "Seu nicho" en la tarjeta de la categoría del profesional; check de selección por coincidencia (template + primaria + fundo).
- **En el cadastro**: elegir categoría aplica automáticamente el template_id del preset (sugerencia, el usuario puede cambiarla); las tarjetas de plantilla muestran el color del nicho elegido. La API de cadastro SIEMBRA el preset completo (template, colores, fondo, fuentes) — ya no todos nacen teal.
- **Decisión de negocio del usuario**: se REVIRTIÓ la protección de borrado de agendamientos que yo había implementado (solo permitía borrar "solicitado") — "no me lo bloquees": el prestador puede eliminar agendamientos en cualquier estado, incluidos cancelados. El borrado físico es una decisión aceptada (limpieza manual > auditoría).
- **Tema pendiente (deuda documentada)**: /demo sigue ofreciendo el template "Escuro" en su tab Personalizar, que NO existe en producción (solo Clássico/Moderno) — el usuario eligió presets + selector antes que crear la 3ª plantilla. Si se hace la plantilla Escuro, debe sincronizarse con /demo.

### Video de fondo + fondos animados + superadmin + Kanban + estilos (Phase 9.7, 2026-08-06)
- **Evidencia sobre video (websearch Firework/EyeView)**: los +80% de conversión atribuidos a "video" son de videos EXPLICATIVOS de producto, no de backgrounds. El background video por sí solo apenas mueve la conversión, pero eleva la percepción premium/calidad — útil en nichos visuales (beleza, unhas, fotografia, gastronomia). Implementado con reglas duras: loop 10–20s, muted + autoplay + playsinline (requisito móvil), poster fallback (foto de fondo), overlays para legibilidad, máx 15MB vía `/api/upload/logo?destino=video`.
- **Bug latente encontrado**: `@keyframes gradientShift` se usaba en los fondos mesh/aurora pero NUNCA estaba definido en globals.css → la animación nunca corría. Ahora definido + `prefers-reduced-motion` global (accesibilidad).
- **Fondos animados estilo 21.dev**: 2 fondos nuevos (`blobs`, `grid`) + mesh/aurora con drift lento de gradientShift. FUNDOS pasa de 8 a 10. El motor ya existía (`fundo_estilo` + `fundoStyle` en backgrounds.ts) — solo había que enriquecerlo.
- **Superadmin → landing**: antes el admin NO podía tocar el look de la landing del prestador (solo el prestador). Ahora `PATCH /api/admin/tenant/config` (valida template_id 1|2, fundo_estilo contra FUNDOS, video_fundo string|"") + sección "Landing do prestador" en TenantDetailClient (selects plantilla/fondo + URL de video). Útil para el equipo AN.BR al configurar pilotos.
- **Kanban en agendamentos**: vista Lista/Quadro con 4 columnas por estado. Hallazgo: `components/painel/Sidebar.tsx` (desktop viejo) es código muerto — sin imports en el repo; `SidebarClient.tsx` es el único real y ya enlaza `/clientes`.
- **CRM embudo: YA EXISTÍA** (`/painel/clientes` + `src/lib/etapas-cliente.ts` con `obterEtapaCliente`/`HistoricoCliente`: etapa por cliente según historial de agendamentos, funnel de 5 etapas). No se implementó nada nuevo — se validó contra el código.
- **Auditoría de estilos de landing (la cara del negocio)**: los componentes compartidos (CtaFinal con cta-glow, Nav sticky con blur, WhatsAppFloat con hide-on-scroll) ya eran sólidos. Top-3 mejoras CRO implementadas: (1) **MobileCtaBar** sticky inferior en mobile con CTA "Agendar agora" + WhatsApp (aparece tras 520px de scroll, respeta safe-area); (2) **duración visible** en tarjetas de Servicos para precio fijo (`R$ 80 · 1h30`); (3) **smooth scroll** + scroll-margin en #servicos (anclas ya no quedan bajo el nav sticky). WhatsAppFloat se oculta en mobile cuando la barra está visible (sin solapamiento).

### Análisis de estados de agendamiento + Auto-confirmar (Phase 9.8, 2026-08-06)
- **Hallazgo del análisis (el CEO tenía razón)**: cuando el cliente agenda por la web, `POST /api/agendamentos` (1) crea el agendamiento como "solicitado" y (2) YA envía al cliente el mensaje de confirmación por WhatsApp que dice "está confirmado" (`msg_confirmacao` en servicos-padrao). El botón "Confirmar" del painel SOLO cambiaba el estado en la BD — no enviaba nada. Los lembretes van a solicitado Y confirmado por igual (no discrimina); el cron solo cierra "confirmado" con fecha pasada; cancelar NO notificaba al cliente (hueco real).
- **Decisión del usuario — Opción A (auto-confirmar)**: los agendamientos web nacen "confirmado" directo. El mensaje de confirmación al cliente no cambia (ya se enviaba). "solicitado" queda solo para filas legacy (las manuales del painel ya nacían confirmadas). Kanban conserva las 4 columnas.
- **Hueco cerrado**: `enviarCancelamento()` en notificacoes.ts — al cancelar, el cliente recibe WhatsApp con el servicio/fecha/hora cancelados + link de remarcar. Se llama desde PATCH /api/agendamentos/[id]/status.
- **Video de fondo en mobile**: desactivado en <768px y con prefers-reduced-motion → color automático (gradiente `primary2E → var(--color-bg)`) derivado del color primario de la marca. Desktop sin cambios.
- **Título "Não encontrado | AN.BR"**: transitorio en producción (el layout del slug hacía 404 completo si el lookup fallaba momentáneamente). Confirmado en vivo: el título actual es correcto. Blindaje: generateMetadata propio del painel (admin client + try/catch → "X — Painel", fallback "Painel").
- **UX reservar mobile**: stepper compacto ("Passo X de N"), autofill (name/tel/street-address + inputMode tel), barra sticky inferior de resumen (servicio + total + Continuar/Finalizar que scrollea al paso). Success screen ahora dice "Horário confirmado!".
- **Pendiente Meta**: si se quiere template oficial de cancelación (`cancelamento_agendamento`) en Meta Cloud → App Review (hoy se envía por texto libre best-effort).

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Planificación con archivos en root del proyecto | Memoria persistente, recuperable tras /clear |
| Demo del painel en `/demo` con datos mock, sin auth | Demuestra el producto sin fricción ni datos reales |
| Depoimentos: leer avaliacoes publicadas server-side con fallback | Prueba social real; si no hay datos, placeholders no engañan |

## Validación del Diagnóstico QA contra el Código (2026-08-06)

### Confirmado (real en el código):
1. **Sin demo del painel** — `/admin` (src/app/admin/page.tsx:13-17) redirige a `/` si no eres super-admin. El painel real es `/[slug]/painel` con login propio (`/painel/login`). La home solo tiene mock estático del booking (src/app/page.tsx:200-246), nada del dashboard. → P0 confirmado.
2. **`/login` da 404** — El login real es `/entrar` (src/app/entrar/page.tsx) y `/[slug]/painel/login`. No existe redirect `/login`. → P0 confirmado.
3. **Sin testimonios en home** — No hay depoimentos en src/app/page.tsx. PERO el sistema de avaliações YA EXISTE en la plataforma: tabla `avaliacoes` con status (publição de depoimento en `/[slug]`), API `src/app/api/avaliacoes/route.ts`, flujo convite→avaliar→publicar (`[slug]/avaliar`, `painel/avaliacoes`). → P1 confirmado con oportunidad de integración real.
4. **Chat AI solo mock** — Home tiene chat animado estático (src/app/page.tsx:226-246). Existe `/api/agent/chat` (src/app/api/agent/chat/route.ts) y `resolveApiKey` per-tenant. → P2 factible.

### Matices (el diagnóstico externo no los vio):
- **Marca/dominio**: decisión de negocio, NO de código. Dominio autonexabrasil.com.br vs marca AN.BR (rebranding ya hecho en commit 01c29f2).
- **`/cadastro` NO está en blanco**: es un form de 1 página completo (categoría → datos → términos, src/app/cadastro/page.tsx, ~560 líneas). La crítica "solo muestra la categoría" = el resto del form está debajo del fold; falta indicador de progreso.
- **Demo visual del booking en home existe** y es de buena calidad (calendario + horarios + card AI flotante).
- **Stats bar con AnimatedCounter** ya existe (5 min / 30 agendamentos / 40% / 24h).
- **Pricing 3 columnas** con MAIS POPULAR ya existe en home y en `/precos`.
- **Antes vs Depois** ya existe (3 comparaciones).
- **FAQ** ya existe. **Categorías** con 13 nichos ya existe.
- **Painel real es rico**: métricas, agenda, QR Pix, onboarding wizard, insights, DashboardCharts (recharts), AI Ads, StatusAgente, avaliacoes, ofertas, plano.

### Estructura de auth relevante:
- `PainelAuthGate.tsx`: gate client-side, login page `/{slug}/painel/login`, verifica profiles.profissional_id y slug match.
- `admin/page.tsx`: server-side, `isAdminPlataforma()` (src/lib/auth-roles.ts).
- `entrar/page.tsx`: login global con email/senha.
- Supabase: sessions cookie-based (createClient de @/lib/supabase/server y /client).

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Chat AI "pensando..." sin respuesta (negocio nuevo con API key propia) | 3 bugs: (1) `/api/agent/chat` solo trataba `result.status === 400` — un error del provider (500) pasaba como 200 con `resposta: undefined` → silencio total en la UI. Fix: `if (result.error)` → 400/500. (2) `buscarContextoRAG` lanza si no hay `OPENAI_API_KEY` global (embeddings ignoran la key del tenant) → mataba el chat antes de llamar al modelo. Fix: try/catch → RAG opcional. (3) Sin timeout (SDK espera 10 min). Fix: Promise.race 60s en route + AbortController 75s en AgenteClient. |
| GeminiProvider y getOpenAI usaban chaves globales | Verificado: los providers SÍ reciben la key del tenant (`config.apiKey || env`) — solo los embeddings dependen de la env global (ahora no-fatal) |
|       |            |

## Resources
- AGENTS.md (memoria del proyecto)
- src/app/page.tsx (home — 606 líneas)
- src/app/admin/page.tsx (super admin)
- src/app/entrar/page.tsx (login global)
- src/app/(slug)/[slug]/painel/* (painel profesional)
- src/app/api/avaliacoes/route.ts (API depoimentos)
- src/app/api/agent/chat/route.ts (API chat AI)
- src/lib/auth-roles.ts (isAdminPlataforma)
- src/app/(slug)/[slug]/painel/PainelAuthGate.tsx (gate painel)
- supabase/seed.sql (tenant demo)

## 2026-08-07 — Hallazgos migración Cloudflare
- Netlify Free 2026: sistema de CRÉDITOS (300/mes, deploy = 15 créditos, ~20 deploys). Bloquea production deploys cada ciclo — estructural, no se puede evitar sin pagar
- Vercel Hobby: 6000 min build/mes (20x Netlify) pero TOS 'personal, non-commercial only' — riesgoso para SaaS con planes de pago; sin Vercel Cron en Hobby
- Cloudflare Workers Free: 100K requests/día + 10ms CPU/request (wall-time SIN límite para HTTP) — el chat del agente (I/O-bound, espera LLM) funciona gratis; SOLO CPU pesado es problema
- Oracle Always Free (2026): 2-4 OCPU ARM + 12-24GB RAM gratis para siempre; aprobación de cuenta aleatoria; región no cambiable; instancias idle reclamadas
- OpenNext (adaptador Cloudflare): build funciona en Windows, pero wrangler dev falla al resolver Durable Objects (queue.js, sharded-tag-cache.js, bucket-cache-purge.js) — problema conocido, usar deploy directo (Linux) o WSL
- Next 16: proxy.ts (ex middleware) corre SIEMPRE en Node y no acepta runtime config — para edge (Cloudflare) hay que usar convención middleware.ts (deprecada pero soportada)
- @supabase/ssr en middleware fuerza Node runtime → en edge usar fetch directo a REST API con headers apikey/Authorization
- Validación open-next.config.ts (ensure-cf-config.js): exige wrapper cloudflare-node + converter edge + proxyExternalRequest fetch + caches (dummy|function) + edgeExternals node:crypto + middleware external con wrapper cloudflare-edge

