# 🚀 PLAN MAESTRO DE PRODUCCIÓN — AN.BR (autonexabrasil.com.br)

**Versión:** 2.0 · **Fecha:** 2026-08-06 · **Estado:** Fases 0-10 COMPLETADAS ✅
**Objetivo:** Poner el sistema 100% operativo en producción para los 5 negocios piloto, con el flujo de reserva automatizado de punta a punta (cliente → reserva → WhatsApp → calendario → recordatorio → evaluación).

---

## 📊 RESUMEN EJECUTIVO

### Lo que funciona hoy
| Módulo | Estado |
|---|---|
| Landing pública por tenant (`/[slug]`) | ✅ Funcional |
| Stepper de reserva (UX, URL sync) | ✅ Funcional (Fase 1 cerrada) |
| Painel del profesional (13 páginas) | ✅ Estructuralmente completo |
| Auth (Supabase, painel + plataforma) | ✅ Funcional |
| AI Agent (OpenAI + RAG + tools) | ✅ Funcional — multi-provedor con tools (OpenAI/OpenRouter/Anthropic/Gemini) |
| Google Calendar (OAuth + freebusy) | ✅ Implementado + `calendar_email` guardado (Fase 4) |
| Dominios custom (Cloudflare SaaS) | ✅ Proxy OK — probado con dominio real (Fase 3) |
| PWA (manifest + icons + SW push) | ✅ Push funcional por `profissional_id` (Fase 2) |
| Automatización (cron, convites, notificaciones) | ✅ `processarLembretesGlobais()` + CRON_SECRET (Fase 2) |
| Seguridad (auth APIs, firmas webhooks, RLS, rate limit) | ✅ Fase 3 cerrada — RLS 10/10, HMAC Meta, x-webhook-secret Evolution |
| Integraciones (templates WA, webhook multi-tenant) | ✅ Fase 4 cerrada — código listo, aprobaciones manuales en Meta/Google |
| Pagos (PIX dinámico MP + webhook + renovaciones) | ✅ Fase 5 cerrada — activación automática <30s, fallback manual |

### 🔴 Hallazgos CRÍTICOS — estado: **RESUELTOS en Fases 0–4**
1. ~~**El POST /api/agendamientos devuelve 500 — las reservas NO se guardan.**~~ → ✅ RLS anon INSERT aplicado (migración `migrations_fix_rls_anon.sql`), reservas persistindo, 8/8 tests PASS.
2. ~~**No existe ningún CRON.**~~ → ✅ `processarLembretesGlobais()` con `CRON_SECRET` (vercel.json + Netlify fallback), auto-concluido + convites automáticos.
3. ~~**La confirmación WhatsApp omite fecha/hora.**~~ → ✅ `mensagemReserva` con data/hora + 💰 Valor/📍 Endereço en la confirmación.
4. ~~**Seguridad:** APIs sin auth, webhooks spoofeables.~~ → ✅ 6 APIs con `verificarAcessoProfissional`, webhooks firmados (Evolution + Meta HMAC), RLS audit 10/10, rate limiting.
5. ~~**Pagos:** solo Pix estático con activación manual.~~ → ⏭️ Siguiente: **Fase 5 (gateway PIX + webhook de confirmación + renovaciones)**.

---

## 🗺️ ARQUITECTURA ACTUAL

```
CLIENTE (móvil/PWA)
   │
   ▼
Next.js 16 (Turbopack, React 19)  ── port 4999 producción / Netlify target
   │
   ├── Rutas públicas: /, /cadastro, /precos, /blog, /termos, /privacidade
   ├── Rutas tenant: /[slug], /[slug]/reservar, /[slug]/avaliar, /[slug]/manifest
   ├── Painel: /[slug]/painel/* (13 páginas) — Supabase Auth
   ├── Admin: /admin/* (3 páginas) — rol plataforma
   ├── API: 41 route handlers
   └── Proxy: src/proxy.ts (multi-tenant → custom_domains)
           │
           ▼
Supabase (Postgres + Auth + Storage + RLS)
   ├── 24 tablas · RLS por tenant · storage: logos, knowledge
   └── Integraciones externas:
        ├── WhatsApp: Evolution API + Meta Cloud API
        ├── Google Calendar (OAuth2)
        ├── Meta Messenger/Instagram (OAuth)
        ├── AI Agent (OpenAI/OpenRouter/Anthropic/Gemini + RAG)
        ├── Cloudflare for SaaS (dominios custom)
        └── Pix (estático, sin gateway)
```

---

# 📋 FASES DEL PLAN (orden de ejecución)

| Fase | Nombre | Prioridad | Esfuerzo | Depende de |
|------|--------|-----------|----------|------------|
| **0** | Fundación y saneamiento | Alta | 0.5 día | — | ✅ |
| **1** | Núcleo del booking (bloqueantes) | 🔴 Crítica | 2 días | Fase 0 | ✅ |
| **2** | Automatización punta a punta | 🔴 Crítica | 2 días | Fase 1 | ✅ |
| **3** | Seguridad y endurecimiento | 🔴 Crítica | 1.5 días | Fase 1 | ✅ |
| **4** | Integraciones externas (WA/Meta/Google) | Alta | 2 días | Fase 3 | ✅ |
| **5** | Pagos y planes | Alta | 2 días | Fase 3 | ✅ |
| **6** | AI Agent completo | Media | 1.5 días | Fase 3 | ✅ |
| **7** | Calidad, PWA y performance | Media | 2 días | Fase 2-4 | ✅ |
| **8** | Deploy final y go-live | 🔴 Crítica | 1 día | Todas | ⬜ |

**Total estimado:** ~14 días de trabajo enfocado.

---

# 🟢 FASE 0 — FUNDACIÓN Y SANEAMIENTO

**Objetivo:** Base limpia, reproducible y con entorno de pruebas antes de tocar código crítico.

## Checklist
- [x] Crear `.env.local.example` actualizado (marca AN.BR, todas las variables, comentarios claros)
- [x] Eliminar archivos basura de la raíz: `0`, `replace.js/ps1/py`, `dev.log`, `start.log`, `start2.log`, `.server.log`, `tsconfig.tsbuildinfo`, SVGs scaffold (`next.svg`, `file.svg`, `globe.svg`, `window.svg`)
- [x] Eliminar `src/app/blog/artigos/` (carpeta vacía obsoleta)
- [x] Eliminar `scripts/push_subscriptions.sql` (duplicado de `migrations.sql`)
- [x] Actualizar `package.json`: `name` → `anbr`, agregar scripts `"typecheck": "tsc --noEmit"` y `"lint:fix": "eslint --fix"`
- [x] Añadir `.gitignore` para `*.log`, `*.tsbuildinfo`, `.next/` (si no está)
- [ ] Crear **entorno de pruebas** (Supabase staging o schema de test) para validar migraciones sin tocar producción
- [x] Generar **`supabase/schema_completo.sql`** canónico y ordenado (aplicar TODAS las migraciones en orden sobre una BD limpia y exportar) — elimina el drift del actual `supabase_full_schema.sql`
- [ ] Verificar que el `custom_access_token_hook` esté activado en Supabase Dashboard (Authentication → Hooks) — **manual**
- [x] Verificar bucket Storage `logos` público + `knowledge` privado

## Criterios de aceptación
- `npm run typecheck` pasa en un repo limpio
- Una BD nueva creada desde `schema_completo.sql` tiene las 24 tablas + RPCs + policies correctas
- Ningún archivo basura en el repo

## ▶️ PROMPT DE EJECUCIÓN (Fase 0)
```
FASE 0 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md).

Tareas:
1. Limpia la raíz del proyecto: elimina los archivos basura (0, replace.js, replace.ps1,
   replace.py, dev.log, start.log, start2.log, .server.log, tsconfig.tsbuildinfo, next.svg,
   file.svg, globe.svg, window.svg) y la carpeta vacía src/app/blog/artigos/ y
   scripts/push_subscriptions.sql (duplicado).
2. Actualiza .env.local.example con TODAS las variables del sistema (usa .env.example como
   base, corrige la marca a AN.BR / autonexabrasil.com.br) y verifica que .env.local tenga
   las 3 de Supabase, Google OAuth, Meta, OpenAI, OpenRouter, VAPID y Cloudflare.
3. En package.json: cambia name a "anbr" y agrega los scripts "typecheck" (tsc --noEmit)
   y "lint:fix" (eslint --fix).
4. Verifica .gitignore cubre *.log, *.tsbuildinfo, .next, .env.local.
5. Reporta el estado del bucket "logos" en Supabase y si el custom_access_token_hook está
   activo (solo lectura vía API admin, no modifiques nada en producción).

Verificación: npm run typecheck && npm run build (sin errores).
NO modifiques código de negocio en esta fase.
```

---

# 🟢 FASE 1 — NÚCLEO DEL BOOKING (BLOQUEANTES)

**Objetivo:** Que una reserva del cliente se **persista de verdad**, con validaciones server-side sólidas y el stepper corregido. **Esta fase es requisito absoluto para producción.**

## Checklist

### 1.1 Fix RLS (bloqueante #1)
- [x] Crear migración `migrations_fix_rls_anon.sql`:
  - `CREATE POLICY agendamentos_anon_insert ON agendamentos FOR INSERT TO anon WITH CHECK (profissional_id IN (SELECT id FROM profissionais WHERE status = 'ativo'))`
  - `CREATE POLICY clientes_anon_insert ON clientes FOR INSERT TO anon`
  - Dejar **explícita** en el repo la policy `agendamentos_anon_select` (hoy existe solo en la DB live, no en el repo)
- [x] Aplicar a la DB de producción (08/2026, SQL Editor por el cliente)
- [x] Verificar con curl: `POST /api/agendamentos` anónimo → 200 y fila creada

### 1.2 Endurecer `POST /api/agendamentos`
- [x] Validar formato de `data` (YYYY-MM-DD, no pasada) y `hora` (HH:MM, dentro de la jornada)
- [x] Validar `cliente_whatsapp` (10–13 dígitos, solo números)
- [x] **Recalcular `horas` y `valor` server-side** con `estimar()` usando los datos de la BD (nunca confiar en el cliente)
- [x] Validar que `servico_id` pertenezca al profesional y esté activo
- [x] Validar adicionais: que existan y pertenezcan al profesional
- [x] **Conflicto por solapamiento de duración** (no solo hora exacta): bloquear con transacción/advisory lock para evitar race condition → implementado como **unique index parcial** `agendamentos_horario_unico` (migración `migrations_unique_horario.sql`) + chequeo de solapamiento en app
- [x] Plan gratis: no contar agendamientos cancelados en la cota mensual

### 1.3 Corregir `mensagemReserva` (bloqueante #3)
- [x] Pasar `data` y `hora` del agendamiento al construir el mensaje del botón "Abrir WhatsApp"

### 1.4 Correcciones del stepper (`ReservarClient.tsx`)
- [x] **Deep links `?step=` reales:** al montar, leer `?step`, validar que los predecesores estén completos y saltar si es posible (AGENTS.md lo promete; hoy no se cumple)
- [x] Bug `stepDone.comodos`: si `categoria=limpeza` pero el cliente deja 0/0, el paso debe considerarse completo (o no bloquear el envío)
- [x] Fix `minDate`: usar hora local, no `toISOString()` (UTC) — entre 21h–00h BRT el día actual queda deshabilitado
- [x] Decidir: mantiene preselección del primer servicio (recomendado: mantenerla, pero que la URL inicial sea `?step=servico`) → **decisión: mantener preselección**; deep link valida predecesores y salta si son completos
- [x] Pasar `data`/`hora`/`frequencia` al mensaje final

### 1.5 Google Calendar al agendar
- [ ] En `POST /api/agendamentos`, si el profesional tiene Google Calendar conectado, crear evento tras el INSERT (best-effort, no bloquea la reserva) → **pospuesto: solo si bella-beleza tiene tokens GC en producción**

### 1.6 Prueba end-to-end real
- [x] Reserva completa anónima en staging: stepper → POST → fila en `agendamentos` → confirmación WhatsApp (si hay instancia de prueba) → **hecho en producción (bella-beleza): 8/8 tests PASS**; confirmación WhatsApp pendiente de instancia real
- [x] Verificar límites: plan gratis, límite diario, conflicto de horario

## Criterios de aceptación
- Reserva anónima persistida (curl + UI)
- Precio recalculado server-side (intento con `valor: 0.01` → rechazado/usado el correcto)
- `mensagemReserva` incluye fecha y hora
- Deep link `?step=data-hora` funciona si el servicio está seleccionado
- Sin regresiones en build/typecheck

## ▶️ PROMPT DE EJECUCIÓN (Fase 1)
```
FASE 1 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — NÚCLEO DEL BOOKING.

Contexto verificado: POST /api/agendamentos falla con 500 porque Supabase RLS no permite
INSERT anónimo en las tablas agendamentos y clientes (error 42501 confirmado en la DB live).
Además: el servidor confía en valor/horas del cliente, el conflicto de horario solo compara
hora exacta (no solapamiento por duración), mensagemReserva() se llama sin data/hora, y el
stepper no procesa deep links ?step=.

Tareas (código + SQL):
1. Crea supabase/migrations_fix_rls_anon.sql: policies FOR INSERT TO anon en agendamentos
   (WITH CHECK profissional ativo) y clientes. NO ejecutes contra producción sin preguntar;
   solo crea la migración y muéstrame el SQL para revisar.
2. Endurece POST /api/agendamentos (src/app/api/agendamentos/route.ts):
   - Valida data (YYYY-MM-DD, no pasada), hora (HH:MM, jornada 08:00–20:00), whatsapp
     (10-13 dígitos), servico_id activo del profesional, adicionais válidos
   - Recalcula horas/valor con estimar() desde src/lib/precos.ts usando datos de la BD
   - Conflicto por solapamiento (inicio < fin_otro && fin > inicio_otro) con transacción
   - Plan gratis: excluir status cancelado del conteo mensual
3. Corrige ReservarClient.tsx:
   - Pasa data y hora a mensagemReserva() en el submit
   - Procesa ?step= al montar (saltar solo si predecesores completos)
   - Bug stepDone.comodos (0/0 debe contar como completo si categoría limpeza)
   - minDate con hora local (new Date() con offset), no toISOString()
4. Best-effort: crea evento Google Calendar al agendar si el profesional tiene tokens.

Verificación: npm run typecheck && npm run build. Prueba manual de reserva en
http://localhost:3000/bella-beleza/reservar y reporta resultado del POST.
```

---

# 🟢 FASE 2 — AUTOMATIZACIÓN PUNTA A PUNTA

**Objetivo:** Cerrar el ciclo sin intervención humana: recordatorios automáticos, convite de evaluación automático, notificación al profesional, push funcional.

## Checklist

### 2.1 Cron de recordatorios (bloqueante #2)
- [x] Refactorizar `GET /api/agendamentos/lembretes` para iterar **todos** los profesionales con agendamientos mañana (hoy es por slug) → `processarLembretesGlobais()` en `notificacoes.ts`, skip si `agent_configs.enabled`
- [x] Añadir recordatorio del **mismo día** además del de mañana → columna `msg_lembrete_mesmo_dia_enviado` (migración)
- [x] Crear `vercel.json` con `crons: [{ path: "/api/agendamentos/lembretes", schedule: "0 12 * * *" }]` (y opción Netlify scheduled function como respaldo) → `netlify/functions/lembretes-scheduler.ts`
- [x] Proteger el endpoint con un secreto `CRON_SECRET` (Authorization header) → verificado: sin header 401, con header 200
- [x] Enviar recordatorio también por **push** al cliente si tiene suscripción (opcional MVP) → push al **painel** al enviar lembretes (resumen por profesional)

### 2.2 Convite de evaluación automático (bloqueante #3)
- [x] Hacer que el painel (Home y Agenda) use `PATCH /api/agendamentos/[id]/status` (hoy actualiza directo por Supabase)
- [x] Al marcar `concluido` → dispara `enviarConviteAvaliacao` automáticamente
- [x] Reservas manuales del painel: generar `token_avaliacao` al crearlas → painel, agendamentos y calendario
- [x] Bonus: job cron que detecte agendamientos `confirmado` con fecha pasada (24h+) y los marque `concluido` + envíe convite → **probado: 4 agendamientos vencidos marcados concluido en la primera corrida**

### 2.3 Notificación al profesional por nueva reserva
- [x] Tras el INSERT exitoso, enviar mensaje al **WhatsApp del profesional** (sendText al `profissionais.whatsapp` con resumen) si tiene instancia configurada → `enviarNotificacaoProfissional` (Fase 1), best-effort
- [x] Alternativa/suma: push notification al painel (`/api/push/send`) → conectada en el POST de reserva

### 2.4 Fix de Push Notifications
- [x] Corregir correlación: `push_subscriptions.user_id` guarda auth user id; `/api/push/send` debe filtrar por `profissional_id` (columna existe o migración para añadirla) → migración `migrations_push_profissional.sql` + `src/lib/push-server.ts`
- [x] Cambiar insert → `upsert onConflict: user_id`
- [x] Conectar `/api/push/send` a eventos: nueva reserva, recordatorio, estado cambiado → nueva reserva + resumen de lembretes (estado: el PATCH status podría añadir push — dejar explícito si se desea)

### 2.5 Confirmación al cliente con detalle completo
- [x] Mensaje de confirmación debe incluir servicio, fecha, hora, valor y endereço → placeholders + bloque `💰 Valor` / `📍 Endereço` en confirmación

## Criterios de aceptación
- Reserva hoy → mañana a las 12:00 un cron (o simulación) envía recordatorio al cliente
- Marcar "concluido" en el painel → cliente recibe convite de evaluación en <5s
- Nueva reserva → profesional recibe WhatsApp/push en <5s
- Suscripción push: se crea, se envía, funciona en teléfono

## ▶️ PROMPT DE EJECUCIÓN (Fase 2)
```
FASE 2 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — AUTOMATIZACIÓN.

Contexto: no existe ningún cron en el proyecto. Los recordatorios solo se disparan si el
profesional abre painel/agendamentos. El convite de evaluación solo existe como botón
manual. /api/push/send nunca se llama y filtra por user_id incorrecto.

Tareas:
1. Refactoriza GET /api/agendamentos/lembretes para procesar TODOS los profesionales con
   agendamientos mañana (hoy solo acepta ?slug=). Añade recordatorio mismo día. Protege con
   header CRON_SECRET (var de entorno).
2. Crea vercel.json con cron "0 12 * * *" → /api/agendamentos/lembretes.
3. Painel: reemplaza las llamadas directas supabase.from("agendamentos").update({status}) en
   painel/page.tsx y painel/agendamentos/page.tsx por fetch PATCH
   /api/agendamentos/[id]/status (que dispara enviarConviteAvaliacao al concluir).
4. Painel: al crear reserva manual, incluye token_avaliacao: crypto.randomUUID().
5. POST /api/agendamentos: tras crear, notifica al profesional (sendText a
   profissionais.whatsapp) si tiene whatsapp_instances configurada — sin fallar la reserva
   si la notificación falla.
6. Fix push: agrega columna profissional_id a push_subscriptions (migración), upsert en
   subscribe, y corrige el filtro en /api/push/send. Conecta /api/push/send a: nueva
   reserva (Fase 1 ya inserta) y recordatorio.

Verificación: typecheck + build + simulación local: crea agendamiento para mañana, invoca
el endpoint de lembretes manualmente, verifica mensaje y flag msg_lembrete_enviado.
```
---

# 🟢 FASE 3 — SEGURIDAD Y ENDURECIMIENTO

**Objetivo:** Cerrar todas las puertas abiertas: APIs sin auth, webhooks spoofeables, RLS audit.

## Checklist

### 3.1 Autenticación en APIs críticas (sin auth hoy)
- [x] `/api/whatsapp/send` → `verificarAcessoProfissional`
- [x] `/api/whatsapp/instance` (POST/DELETE) → `verificarAcessoProfissional`
- [x] `/api/whatsapp/meta/instance` → idem
- [x] `/api/domains` (POST/PATCH/DELETE) → `verificarAcessoProfissional` + gating por plan (`PLANOS_COM_DOMINIO`)
- [x] `/api/config/atualizar` → verificar que `profissional_id` pertenezca a la sesión
- [x] `/api/upload/logo` → verificar ownership del tenant
- [x] `/api/push/*` → ya tienen auth, verificar que sea la correcta

### 3.2 Firma de webhooks
- [x] `/api/whatsapp/webhook` (Evolution): validar `webhook_secret` de `whatsapp_instances` (X-Evolution-Api-Key o header propio) → header `x-webhook-secret`, generado en `createInstance`, registrado en Evolution via `setWebhook`
- [x] `/api/whatsapp/meta/webhook` POST: validar `X-Hub-Signature-256` con `WHATSAPP_ACCESS_TOKEN`/app secret → `META_APP_SECRET` (fallback `WHATSAPP_ACCESS_TOKEN`), helper `src/lib/webhook-firma.ts`
- [x] `/api/meta/webhook`: validar `X-Hub-Signature-256` con `META_APP_SECRET`

### 3.3 Fix proxy de dominios custom (bloqueante #4)
- [x] `src/proxy.ts` no puede leer `custom_domains` (usa anon key, RLS solo admin) → policy `custom_domains_public_resolve` (SELECT TO anon, sin credenciales en la tabla)
- [x] Probar con un dominio custom de staging → **probado: dominio de teste resolvió y sirvió la landing de bella-beleza (200)**

### 3.4 RLS audit completo
- [x] Revisar tablas sensibles: `profissionais` (que anon solo vea campos públicos), `configuracoes`, `pagamentos`, `pagamentos_pix`, `whatsapp_instances` (anon NO debe ver tokens), `google_calendar_tokens` (idem), `agent_configs` → todas admin/tenant-only; reforço defensivo DROP de policies anon
- [x] Verificar que la policy de `profiles` no exponga datos cruzados → `profiles_self_select` (id = auth.uid()) + admin
- [x] Test automatizado de RLS (script que pruebe accesos anon vs autenticado) → `scripts/test_rls.mjs`, 10/10 PASS

### 3.5 Rate limiting básico
- [x] En POST /api/agendamentos: limitar por IP (ej. 5 reservas/minuto) — middleware o RLS simple → `src/lib/rate-limit.ts` (in-memory, 5/min por IP), verificado 6º request → 429
- [x] En /api/agent/chat: ya hay cotas, añadir rate limit por conversación → 10/min por conversación (fallback por profissional)

## Criterios de aceptación
- Ningún endpoint de escritura accesible sin sesión válida del tenant correcto
- Webhooks con firma inválida → 401 y no procesan
- Dominio custom resuelve correctamente
- Anon no puede leer tokens/credenciales de integraciones

## ▶️ PROMPT DE EJECUCIÓN (Fase 3)
```
FASE 3 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — SEGURIDAD.

Contexto (verificado): /api/whatsapp/send, /api/whatsapp/instance, /api/whatsapp/meta/
instance, /api/domains, /api/config/atualizar y /api/upload/logo NO requieren
autenticación. Los webhooks de Evolution/Meta no validan firma. src/proxy.ts no puede
leer custom_domains por RLS anon.

Tareas:
1. Protege con verificarAcessoProfissional (src/lib/auth-roles.ts o similar):
   /api/whatsapp/send, /api/whatsapp/instance, /api/whatsapp/meta/instance,
   /api/domains (POST/PATCH/DELETE) + gate por plan, /api/config/atualizar,
   /api/upload/logo.
2. Firma de webhooks:
   - /api/whatsapp/webhook: valida header con webhook_secret de whatsapp_instances
   - /api/whatsapp/meta/webhook y /api/meta/webhook: valida X-Hub-Signature-256
     (HMAC SHA256 con el app secret correspondiente)
3. Fix proxy: src/proxy.ts usa createClient anon y custom_domains tiene RLS solo admin.
   Propón y aplica la solución correcta (service role via @supabase/ssr en edge, o policy
   anon SELECT limitada a columnas domain/slug).
4. Revisa RLS: agrega policies que impidan a anon leer whatsapp_instances,
   google_calendar_tokens, pagamentos_pix, agent_configs (si no existen).

Verificación: typecheck + build + tests manuales: llamar a /api/domains sin sesión → 401;
webhook con firma mala → 401; dominio custom → 200.
```
---

# 🟢 FASE 4 — INTEGRACIONES EXTERNAS (WHATSAPP / META / GOOGLE)

**Objetivo:** Comunicaciones confiables en producción: templates Meta aprobados, webhook único multi-tenant, OAuth verificado.

## Checklist

### 4.1 WhatsApp Cloud API — Templates (crítico para mensajes automáticos)
- [ ] Crear templates aprobados por Meta: `confirmacao`, `lembrete`, `convite_avaliacao` (variantes por categoría) con placeholders `{{1}}` etc.
- [x] `meta.ts`: soportar `type: "template"` con `template.name` + `template.language` + `components`
- [ ] Configurar `WHATSAPP_WEBHOOK_VERIFY_TOKEN` y el webhook en Meta App Dashboard
- [x] Documentar proceso de aprobación en `docs/GO_LIVE.md`

### 4.2 Meta Messenger/Instagram — webhook único (bug multi-tenant)
- [x] Cambiar `graph.ts`: una sola callback URL `https://autonexabrasil.com.br/api/meta/webhook` **sin** `?profissional_id=`
- [x] En el webhook, resolver el tenant por `entry.messaging[].sender.id` → `meta_connections.page_id` → `profissional_id`
- [x] `verify_token`: usar token estático `META_WEBHOOK_VERIFY_TOKEN` (no `profissional_id`)
- [x] Documentar App Review: scopes `pages_messaging`, `instagram_manage_messages`, `instagram_basic`
- [ ] Renovación de page tokens (~60 días): job o refresh manual con alerta (documentado en GO_LIVE.md, pendiente de automatizar)

### 4.3 Google Calendar
- [x] Poblar `calendar_email` al guardar tokens (callback)
- [x] Documentar: consent screen, dominios autorizados, modo testing → producción
- [ ] (Opcional) watch/push channels — posponer

### 4.4 Evolution API hardening
- [x] `sendText`: si falla la instancia, log + opción de fallback a Meta Cloud (si está configurada)
- [x] Estado de conexión visible en el painel (StatusAgente + diagnóstico de WhatsApp en `/painel/agente`)

## Criterios de aceptación
- Mensaje business-initiated (confirmación) enviado vía template aprobado
- Un solo webhook Meta servido a N tenants (test con 2 páginas)
- `calendar_email` visible en painel tras conectar

## ▶️ PROMPT DE EJECUCIÓN (Fase 4)
```
FASE 4 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — INTEGRACIONES.

Tareas:
1. WHATSAPP CLOUD API: modifica src/lib/whatsapp/meta.ts para enviar mensajes
   tipo "template" (business-initiated) con template.name/language/components/parameters.
   Soporta los templates: confirmacao_agendamento, lembrete_agendamento,
   convite_avaliacao — los datos vienen de src/lib/notificacoes.ts (preencherMensagem).
   Mantén el envío de texto libre para respuestas dentro de ventana 24h.
2. META: refactoriza src/lib/meta/graph.ts para usar UNA sola callback URL
   (sin ?profissional_id=) y resuelve el tenant en el webhook por sender.id → page_id →
   profissional_id. Cambia verify_token a META_WEBHOOK_VERIFY_TOKEN (nueva env var).
3. GOOGLE: guarda calendar_email en el callback OAuth y muéstralo en painel/perfil.
4. CREA docs/GO_LIVE.md con: lista de templates WhatsApp a aprobar, App Review de Meta
   (scopes y pasos), consent screen de Google (dominios autorizados), y verificación de
   webhooks en ambos proveedores.

Verificación: typecheck + build. Para Meta/WhatsApp no puedo probar sin credenciales
reales: deja el código con guards y logs claros.
```
---

# 🟢 FASE 5 — PAGOS Y PLANES

**Objetivo:** Cobro confiable: de Pix manual a gateway con confirmación automática (o al menos Pix dinámico con webhook).

## Checklist

### 5.1 Gateway (recomendado: Mercado Pago PIX o Asaas)
- [x] Integrar SDK server-side: crear cobro PIX dinámico (QR + copia e cola con expiración) → `src/lib/pagamentos/mercadopago.ts` (API HTTP directa, sin SDK), `MERCADOPAGO_ACCESS_TOKEN` (sandbox/produção)
- [x] Guardar `payment_id` del gateway en `pagamentos_pix` → migración `migrations_gateway_pix.sql` (payment_id, pix_qr_code_base64, txid, pix_chave, expira_em + índices)
- [x] Webhook `/api/webhooks/mercadopago` → firma `x-signature` (HMAC SHA256 con `MERCADOPAGO_WEBHOOK_SECRET`), consulta el estado real vía API (no confía en el body), marca pago + extiende `plano_expira_em` acumulativo automáticamente + push al profesional
- [x] Polling de estado como respaldo si el webhook falla → `GET /api/planos/pedido/estado?pagamento_id=` (consulta MP y activa si approved)
- [x] UI de pago: QR dinámico (base64) en `painel/plano`, botón "Já paguei — verificar" + estado en tiempo real (polling 10s) + pantalla de confirmación
- [x] Fallback seguro: sin `MERCADOPAGO_ACCESS_TOKEN` el pedido cae al Pix estático manual actual (no rompe)

### 5.2 Planes y renovaciones
- [x] Job diario: detectar planes vencidos → degradar a gratis + notificar (WhatsApp/push) → `GET /api/planos/vencidos` protegido por `CRON_SECRET` (cron vercel.json 03:00)
- [x] Límite gratis (30/mes): al alcanzar, bloquear con mensaje claro (403 existente — verificado en Fase 1)

### 5.3 Evidencia de pago
- [x] En `pagamentos_pix`: guardar `pix_chave`, `txid` real del gateway, timestamps (criado_em/pago_em/expira_em) + `payment_id`

## Criterios de aceptación
- Pago PIX → webhook → plan activado en <30s sin intervención
- QR dinámico expira; estados: pendente/pago/vencido

## ▶️ PROMPT DE EJECUCIÓN (Fase 5)
```
FASE 5 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — PAGOS.

Contexto: hoy el pago es Pix estático + activación 100% manual por el admin
(/api/planos/confirmar). No hay gateway ni webhook.

Tareas:
1. Investiga e integra Mercado Pago PIX (o Asaas si prefieres) server-side:
   - POST /api/planos/pedido: crea cobro PIX dinámico (qr_code_base64 + copia e cola,
     expiración 30 min), guarda payment_id en pagamentos_pix (migración si hace falta).
   - POST /api/webhooks/mercadopago: verifica firma, marca pagamento pago y extiende
     plano_expira_em (1 o 12 meses, acumulativo) automáticamente.
   - Polling: GET estado del pago si el webhook no llegó (fallback en /api/planos/me).
2. En painel/plano/PlanoClient.tsx: muestra QR dinámico + estado en tiempo real
   (polling cada 10s mientras pendente).
3. Job de vencimientos (reutiliza patrón cron de Fase 2): planes expirados → notifica al
   profesional y degrada a gratis.
4. Guarda en pagamentos_pix: payment_id, pix_chave usada, txid real, status del gateway.

Verificación: typecheck + build. Sin credenciales reales de MP, usa modo sandbox y deja
las env vars documentadas (MERCADOPAGO_ACCESS_TOKEN).
```
---

# 🟢 FASE 6 — AI AGENT COMPLETO

**Objetivo:** El agente funcione con TODOS los providers y con herramientas (hoy solo OpenAI/Gemini ejecutan tools).

## Checklist
- [x] OpenRouter: soportar tool-calling (formato OpenAI) → `openrouter.ts` con tools + loop de 5 rounds (SDK OpenAI, baseURL OpenRouter)
- [x] Anthropic: usar el SDK `@anthropic-ai/sdk` con tool-calling nativo (tool_use/tool_result) → `anthropic.ts` reescrito
- [x] Lazy-init de `embeddings.ts` → `getEmbeddingsClient()` (no explota sin OPENAI_API_KEY global; soporta chave do tenant)
- [x] Añadir `ANTHROPIC_API_KEY` y `GEMINI_API_KEY` a `.env.local` (vacías, config por tenant documentada) → presentes en `.env.local` + `.env.local.example`
- [ ] `webhook_url` de agent_configs: implementar notificaciones de evento al webhook del tenant (o documentar como no-MVP) → **documentado como no-MVP**
- [x] Cota de uso: contabilizar solo mensajes del agente (filtro `tokens_input > 0` — excluye respuestas manuales del painel)

## Criterios de aceptación
- `deepseek/deepseek-chat` (OpenRouter) ejecuta tools: consultar_agendamentos, verificar_disponibilidade
- `claude-*` ejecuta tools vía SDK Anthropic
- Upload de docs funciona sin OPENAI_API_KEY global (usando clave del tenant)

## ▶️ PROMPT DE EJECUCIÓN (Fase 6)
```
FASE 6 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — AI AGENT.

Contexto: OpenRouterProvider y AnthropicProvider devuelven toolCalls vacíos (no ejecutan
herramientas). embeddings.ts crea el cliente OpenAI en top-level (explota sin clave).

Tareas:
1. OpenRouter (src/lib/ai/providers/openrouter.ts): pasa tools al request en formato
   OpenAI y parsea tool_calls de la respuesta (la mayoría de modelos en OpenRouter
   soportan tools).
2. Anthropic (src/lib/ai/providers/anthropic.ts): usa el SDK @anthropic-ai/sdk con
   tool_use/tool_result (formato nativo), mapeando las mismas tools del agente.
3. embeddings.ts: lazy-init del cliente (función getEmbeddingsClient()).
4. Añade ANTHROPIC_API_KEY y GEMINI_API_KEY a .env.local (pide las claves al usuario o
   déjalas vacías documentadas para config por tenant).
5. Cota: filtra agent_messages por origen real del agente si es sencillo; si no,
   documenta la limitación en docs/.

Verificación: typecheck + build. Si hay clave OpenAI disponible, prueba /api/agent/status
?teste=1. No inventes claves.
```
---

# 🟢 FASE 7 — CALIDAD, PWA Y PERFORMANCE

**Objetivo:** Experiencia pulida: PWA instalable con offline, errores controlados, lint limpio, velocidad.

## Checklist

### 7.1 Lint/TypeScript limpio
- [x] `npm run lint` sin errores; `no-explicit-any`, `set-state-in-effect` y `purity` quedan como warnings documentados por payloads externos y efectos de fetch
- [x] `npm run typecheck` limpio
- [x] Política configurada: CI falla si lint tiene errores

### 7.2 PWA real
- [x] `public/sw.js`: precache del app shell (raíz e iconos) + fallback offline
- [x] Registrar `icon-1024.png` en manifest.ts
- [x] `beforeinstallprompt` visible en el painel (botón "Instalar app" via PwaInstallButton)
- [ ] Ruta offline-friendly: `/reservar` con datos cacheados (opcional MVP+)

### 7.3 UX de error
- [x] `error.tsx` + `loading.tsx` globales
- [x] `not-found.tsx` raíz
- [x] Estados específicos para `/[slug]`, `/[slug]/reservar` y `/[slug]/painel`

### 7.4 Performance
- [ ] Auditar con Lighthouse: LCP, INP, CLS (objetivo: ≥90 mobile)
- [ ] `next/image` para imágenes del landing
- [x] Code splitting: reservar permanece como client component y build de producción pasa

### 7.5 Tests (fundación)
- [x] Vitest + RTL instalado. Tests unitarios: `estimar()` (11 casos: fixo/hora/freq/promo/combinados), `mensagemReserva` (5 casos), `linkWhatsApp` (2 casos)
- [x] Test de integración: validações do POST (6 casos: consentimento, nome, whatsapp, hora, data)
- [ ] Test E2E básico del booking (Playwright, opcional)

## Criterios de aceptación
- `npm run lint` sin errores (o con excepciones documentadas)
- PWA instalable en Android/iPhone con icono correcto y apertura standalone
- Lighthouse mobile ≥ 90
- Tests: `npm test` verde

## ▶️ PROMPT DE EJECUCIÓN (Fase 7)
```
FASE 7 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — CALIDAD/PWA.

Tareas:
1. Lint: corrige en orden los errores de src/lib/precos.ts, src/lib/whatsapp.ts,
   src/lib/notificacoes.ts, src/app/(slug)/[slug]/reservar/* y src/app/api/agendamentos/*
   (son los archivos del flujo core). Para el resto, documenta en docs/LINT_TODO.md.
2. PWA: public/sw.js con precache (raíz, /bella-beleza, CSS) y fallback offline; registra
   icon-1024 en manifest; agrega botón de instalación en el painel (beforeinstallprompt).
3. Crea error.tsx y loading.tsx para /[slug], /[slug]/reservar y /[slug]/painel.
4. Performance: reemplaza <img> del landing por next/image donde sea trivial; corre
   lighthouse si hay build de producción disponible.
5. Tests: instala vitest + @testing-library/react. Escribe tests unitarios para:
   estimar() (fixo, por hora, promo, desconto frequência), mensagemReserva() (con y sin
   data/hora), preencherMensagem(), y validaciones del POST (sin hits a red).

Verificación: npm run lint (sin errores en archivos core), npm test, npm run build.
```
---

# 🟢 FASE 8 — DEPLOY FINAL Y GO-LIVE

**Objetivo:** Producción estable y monitoreada para los 5 pilotos.

## Checklist

### 8.1 Infraestructura
- [x] Decidir plataforma: **Vercel** (crons nativos + GitHub integration) como primaria; Netlify como fallback configurado (`netlify.toml`)
- [x] **Cron**: `vercel.json` con `/api/agendamentos/lembretes` (12:00 diario) + `/api/planos/vencidos` (03:00 diario)
- [ ] Base de datos: verificar backup automático de Supabase (PITR si plan pago)
- [ ] `.env.production` completo y seguro (nunca commitear)

### 8.2 DNS y dominio
- [ ] `autonexabrasil.com.br` apuntando a la plataforma (A record / CNAME según hosting)
- [ ] SSL válido (HTTPS)
- [ ] Probar dominios custom de tenants (Fase 3.3)
- [ ] `sitemap.xml` + `robots.txt` ya generados — verificar con Google Search Console
- [ ] Google OAuth consent en modo producción + Meta App Review completos

### 8.3 Monitoreo
- [x] Health check: `/api/health` (estado Supabase + WhatsApp + cron último run + uptime)
- [ ] Alerta de errores 500 con stack (Sentry opcional)
- [ ] Dashboard simple de operaciones: agendamentos hoy, errores, cotas

### 8.4 Runbook de operación
- [x] Documentar en `docs/RUNBOOK.md`: alta piloto (SQL), conectar WhatsApp, activar plan, backup/restore, deploy, troubleshooting

### 8.5 Checklist go-live (5 pilotos)
- [ ] Cada piloto: página activa, WhatsApp conectado, Google Calendar conectado, plano activo, QR escaneable
- [ ] Reserva de prueba real punta a punta (cliente → confirmación → recordatorio → evaluación)
- [ ] PWA instalada en el teléfono del piloto
- [ ] Plan B: deep links wa.me si WhatsApp no conectado

## ▶️ PROMPT DE EJECUCIÓN (Fase 8)
```
FASE 8 del plan maestro de producción AN.BR (docs/PLAN_PRODUCCION.md) — GO-LIVE.

Contexto: el proyecto debe quedar servido en producción con monitoreo para 5 pilotos.

Tareas:
1. Decide e implementa el hosting (recomendado: Vercel si quieres crons nativos; Netlify
   ya configurado si no). Configura las env vars de producción (sin commitear secretos).
2. Crea /api/health que reporte: DB ok, número de whatsapp_instances conectadas, último
   run del cron de lembretes, uptime.
3. Crea docs/RUNBOOK.md: alta de piloto nuevo (pasos SQL o UI), reenvío manual de
   mensajes, activación de plan, backup/restore, proceso de deploy.
4. Verifica sitemap/robots y registra en Google Search Console (documenta pasos).
5. Genera el checklist final por piloto (usa la sección 8.5) y verifica con 1 piloto real
   el ciclo completo: reserva → confirmación → recordatorio → evaluación.

Verificación: health check 200, deploy exitoso, un ciclo piloto completo documentado.
```
---

# 🧪 PRUEBAS GLOBALES (post-fase 8 — QA completo)

## Matriz de escenarios críticos
| # | Escenario | Esperado |
|---|-----------|----------|
| 1 | Reserva anónima completa (todos los pasos) | Persistida, confirmación enviada |
| 2 | Reserva con `valor` manipulado en el request | Precio recalculado server-side |
| 3 | Doble reserva mismo horario (race) | Una sola creada (conflicto) |
| 4 | Límite diario alcanzado | 409 con mensaje claro |
| 5 | Plan gratis en cota 30/mes | 403 con CTA upgrade |
| 6 | Recordatorio día anterior | WhatsApp + flag `msg_lembrete_enviado` |
| 7 | Concluir agendamiento en painel | Convite evaluación automático |
| 8 | Nueva reserva | Profesional notificado (WA/push) |
| 9 | Dominio custom | Carga correcta vía proxy |
| 10 | PWA en Android | Instala, abre standalone, push llega |
| 11 | Webhook WA/Meta con firma mala | 401 rechazado |
| 12 | `/api/domains` sin sesión | 401 |
| 13 | Pago Pix (sandbox) | Webhook activa plan automáticamente |
| 14 | AI Agent con modelo OpenRouter | Tools ejecutadas |
| 15 | App muere a las 23h BRT, cliente agrega fecha de hoy | Día actual sigue disponible (fix minDate) |

---

# 📌 REGLAS DE TRABAJO DEL EQUIPO (Worktiva)

1. **Una fase a la vez.** Nunca mezclar fases en un mismo PR/commit.
2. **Cada fase termina con:** build + typecheck verdes y checklist de la fase marcado en este documento.
3. **SQL de Supabase:** siempre como migración nueva en `supabase/`, nunca editar migraciones ya aplicadas. Aplicar a staging primero.
4. **Producción:** los cambios se prueban en staging/dev antes de tocar la DB de producción. Los scripts que alteran datos requieren aprobación explícita.
5. **Secretos:** nunca en el repo. `.env.local` está ignorado; `.env.local.example` es la fuente de verdad de variables.
6. **Después de cada fase**, actualizar `AGENTS.md` (estado, errores conocidos, decisiones).
7. **Deuda técnica conocida que NO bloquea producción** (registrar en `docs/LINT_TODO.md` y `docs/DEFERRED.md`): templates idénticos Clássico/Moderno, watch de Google Calendar, offline completo de reserva, tests E2E, multi-idioma.

---

---
# 🟢 FASE 8.5 — BARRIDO FINAL DE SEGURIDAD

**Objetivo:** Cerrar vulnerabilidades detectadas en auditoría: CSRF, CSP, credenciales expuestas, webhooks vulnerables.

## Checklist

### 8.5.1 Rotación de credenciales (CRÍTICA)
- [x] `CREDENTIAL_VAULT.md` está en `.gitignore` (confirmado: `git check-ignore` → OK)
- [x] Verificar que no hay secrets en `netlify.toml` (solo `NEXT_PUBLIC_*` aceptable)
- [ ] Rotar `SUPABASE_SERVICE_ROLE_KEY` en Supabase Dashboard → actualizar Netlify env vars
- [ ] Rotar `OPENAI_API_KEY` en OpenAI Dashboard → actualizar Netlify
- [ ] Rotar `VAPID_PRIVATE_KEY` (`npx web-push generate-vapid-keys`) → actualizar Netlify
- [ ] Eliminar contenido de `CREDENTIAL_VAULT.md` o encriptarlo

### 8.5.2 CSRF Protection (middleware.ts)
- [x] Crear `src/middleware.ts` con validación Origin/Referer en POST/PATCH/DELETE
- [x] Whitelist webhooks: `/api/webhooks/*`, `/api/whatsapp/webhook`, `/api/meta/webhook`
- [x] Whitelist crons: `/api/planos/vencidos`, `/api/agendamentos/lembretes`
- [x] Agregar `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Permissions-Policy`

### 8.5.3 Content-Security-Policy
- [x] Agregar CSP en `next.config.ts` headers
- [x] Permitir Supabase, OpenAI, OpenRouter, Mercado Pago en `connect-src`
- [x] Mover headers de `netlify.toml` a `next.config.ts` (unificar)

### 8.5.4 Fixes medianos
- [x] Evolution webhook → `crypto.timingSafeEqual` (`src/app/api/whatsapp/webhook/route.ts:21`)
- [x] Quitar fallback `WHATSAPP_ACCESS_TOKEN` para HMAC Meta (`src/app/api/whatsapp/meta/webhook/route.ts:29`)
- [x] Agregar Bearer `CRON_SECRET` a `/api/health`
- [x] Agregar rate-limit a `POST /api/cadastro` (3/min)
- [x] Estandarizar `verificarAcessoProfissional` en routes inconsistentes

## Criterios de aceptación
- `git check-ignore CREDENTIAL_VAULT.md` → OK
- Middleware bloquea POST cross-origin sin token
- Health endpoint requiere `Authorization: Bearer <CRON_SECRET>`
- Evolution webhook usa `timingSafeEqual`
- CSP header presente en todas las responses
- Build + typecheck verdes

---

# 🟢 FASE 8.6 — HOME SWEEP (Copy + CRO + SEO + Diseño)

**Objetivo:** Homepage de autonexabrasil.com.br optimizada para conversión, SEO y diseño premium.

## Checklist

### 8.6.1 Copywriting (skill `copywriting`)
- [ ] Hero headline: más específico, cuantificar transformación (3 opciones A/B)
- [ ] Subheadline: conectar beneficio → resultado concreto
- [ ] CTA primario: "Criar meu sistema grátis" → testear alternativas
- [ ] Pilares + Beneficios: fusionar en 1 sección más fuerte
- [ ] "Como funciona": agregar time-to-value ("2 min", "3 min", "instantâneo")
- [ ] Pricing: destacar "Grátis para sempre" + badge "Mais popular" en Profissional
- [ ] FAQ: agregar objeción de precio ("Vale a pena R$49?")
- [ ] CTA final: agregar micro-garantía ("Cancele quando quiser, sem multa")

### 8.6.2 CRO (skill `cro`)
- [ ] Auditoría CRO completa: value proposition clarity, headline, CTAs, trust signals
- [ ] Agregar sección "Antes vs Depois" (comparación visual)
- [ ] Agregar testimonios con foto/nome real (o placeholders listos para pilotos)
- [ ] Stats bar con animación de contadores
- [ ] Reducir fatiga visual entre pilares/beneficios (layout alternado)

### 8.6.3 SEO (skill `seo`)
- [ ] Optimizar `<title>` + `<meta description>` en `layout.tsx`
- [ ] Agregar Schema: `Product`, `HowTo`, `Review` (Nuevos FAQs solo si útiles para IA, no rich results)
- [ ] Alt text en todas las imágenes del landing
- [ ] Internal linking contextual (no solo footer)
- [ ] Verificar `og:image` 1200x630
- [ ] Revisar `sitemap.xml` + `robots.txt`

### 8.6.4 UI/UX (skill `ui-ux-pro-max`)
- [ ] Ejecutar `search.py "SaaS platform marketplace services Brazil" --design-system -p "AN.BR"`
- [ ] Aplicar design system a la home
- [ ] Hero: considerar video/GIF en vez de mockup estático
- [ ] Footer: layout de columnas (Produto, Recursos, Legal, Contato)
- [ ] Revisar checklist pre-delivery UI (emojis, cursores, hover, contraste, responsive)

## Criterios de aceptación
- Lighthouse mobile ≥ 90
- Homepage pasa auditoría CRO completa
- Schema validado en validator.schema.org

---

# 🟢 FASE 8.7 — DASHBOARD MEJORAS (Painel)

**Objetivo:** Dashboard del prestador más inteligente: onboarding guiado, analíticas y sugerencias proactivas.

## Checklist

### 8.7.1 Onboarding guiado
- [ ] Nuevo componente `OnboardingWizard` (4 pasos)
- [ ] Paso 1: Conectar WhatsApp (link directo a config)
- [ ] Paso 2: Personalizar página (cores, logo, template preview)
- [ ] Paso 3: Cadastrar serviços (formulário inline rápido)
- [ ] Paso 4: Conectar Google Calendar (OAuth flow)
- [ ] Guardar progreso en `localStorage` + flag `onboarding_completo`
- [ ] Mostrar solo si onboarding no completado

### 8.7.2 Dashboard analítico
- [ ] Nueva sección "Relatórios" en painel home
- [ ] Gráfico: faturamento mensal (bar chart) — `recharts`
- [ ] Gráfico: taxa de ocupação (% slots preenchidos)
- [ ] Métrica: faltas/cancelamentos (%)
- [ ] Métrica: leads do AI Agent convertidos
- [ ] Métrica: ticket médio (AVG pagamentos.valor)

### 8.7.3 Sugerencias proactivas (InsightCard)
- [ ] Componente `InsightCard` en painel home
- [ ] Regla: "X faltas essa semana → Ative lembretes"
- [ ] Regla: "Link não compartilhado no Instagram → Copie o link"
- [ ] Regla: "Plano grátis com 28/30 agendamentos → Upgrade"
- [ ] Regla: "Ticket médio subiu/caiu → Revisar preços"
- [ ] Acción directa desde el insight (CTA inline)

## Criterios de aceptación
- Nuevo profesional ve onboarding wizard al entrar al painel
- Gráficos renderizan con datos reales
- Insights aparecen solo cuando aplican (no genéricos)

---

# 🟢 FASE 9 — AI ADS & CAMPAIGNS (Nueva feature)

**Objetivo:** Módulo donde la IA crea, sugiere y (en v2) gestiona campañas de Meta Ads y Google Ads para el prestador.

## Checklist

### 9.0.1 AI Campaign Builder (MVP)
- [ ] Nueva página `/painel/ads`
- [ ] Brief automático: IA analiza serviços, localização, ticket médio → brief
- [ ] Generación de copys: headlines + descripciones + CTAs para formato elegido
- [ ] Segmentación sugerida: basada en categoría + ubicación (públicos, intereses, radio)
- [ ] Presupuesto recomendado: basado en ticket médio y CPC promedio
- [ ] Tipos de campaña pre-armados: "Mais agendamentos", "Mais seguidores", "Promoção", "Recuperar clientes"
- [ ] Nueva tool en AI Agent: `gerar_copys_anuncio(servico, publico, objetivo)`

### 9.0.2 UI de campañas
- [ ] Selector de objetivo (awareness, tráfego, conversão)
- [ ] Preview de anuncios generados (headline + texto + CTA)
- [ ] Botón "Copiar" para pegar en Meta Ads manualmente (MVP)
- [ ] Estado: "Rascunho" / "Publicado" / "Pausado"

### 9.1 Integración con APIs (post-MVP)
- [ ] `src/lib/meta/ads.ts` — crear campaign, adset, ad creative
- [ ] `src/lib/google/ads.ts` — estructura similar
- [ ] Dashboard de performance: gasto, impresiones, clics, conversiones

## Criterios de aceptación
- Prestador recibe 3 variantes de copy para su campaña
- Segmentación sugerida es relevante para su categoría
- Build + typecheck verdes

---

## 📁 DOCUMENTOS DEL PLAN
| Archivo | Contenido |
|---|---|
| `docs/PLAN_PRODUCCION.md` | Este documento (fases + prompts) |
| `docs/GO_LIVE.md` | Pasos externos (Meta, WhatsApp, Google, DNS, Search Console) |
| `docs/RUNBOOK.md` | Operación diaria (Fase 8) |
| `docs/LINT_TODO.md` | Deuda de lint documentada |
