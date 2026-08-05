# 🚀 GO LIVE — Checklist de Integraciones Externas (Fase 4)

Este documento lista todo lo que debe estar **aprobado/configurado manualmente en los paneles de Meta y Google** antes del lanzamiento. El código ya está listo (guards + logs + fallbacks); lo que sigue son pasos humanos en los proveedores.

---

## 1. Templates de WhatsApp (Meta Cloud API)

Mensajes **business-initiated** (fuera de la ventana de 24h) exigen templates aprobados. El sistema usa estos 3 nombres — **deben existir en el WABA con el mismo nombre exacto**:

| Template | Idioma | Parámetros del body | Cuándo se envía |
|---|---|---|---|
| `confirmacao_agendamento` | pt_BR | `{{1}}` serviço, `{{2}}` data (dd/mm), `{{3}}` hora (HH:MM) | Al confirmar una reserva (cliente) |
| `lembrete_agendamento` | pt_BR | `{{1}}` serviço, `{{2}}` data, `{{3}}` hora | Cron diario (mañana/mismo día) |
| `convite_avaliacao` | pt_BR | `{{1}}` nome do cliente, `{{2}}` URL de avaliação | Servicio concluído → convite |

### Cómo crear (Meta Business Suite → WhatsApp Manager → Mensajes → Templates)
1. `Crear template` → categoría **Utility**.
2. Body de ejemplo con placeholders:
   - `confirmacao_agendamento`: `Olá! Seu agendamento de {{1}} está confirmado para {{2}} às {{3}}. Obrigado!`
   - `lembrete_agendamento`: `Lembrete: seu agendamento de {{1}} é para {{2}} às {{3}}. Até lá!`
   - `convite_avaliacao`: `Olá, {{1}}! Como foi seu atendimento? Avalie-nos: {{2}}`
3. Para el convite, marque el parámetro de la URL como **variable URL** (Meta lo exige para enlaces en el body).
4. Enviar a revisión (aprobación típica: minutos a horas para Utility).

> ⚠️ **Fallback garantizado:** si el template no existe / no está aprobado, el código cae al envío de **texto libre** (solo funciona dentro de la ventana de 24h tras mensaje del cliente). Log: `[notificacoes] template não enviado, fallback texto livre`.

### Variables de la confirmación (no caben en el template)
Valor (`💰 Valor`) y endereço (`📍 Endereço`) se envían en el mensaje de texto siguiente, dentro de la ventana de 24h abierta por el propio template.

---

## 2. Meta — App Review y scopes

### App (Facebook Developer → tu app)
| Requisito | Estado |
|---|---|
| App **Live** (no modo Desarrollo) | Obligatorio para producción |
| Dominio agregado en *App Settings → Basic → App Domains* | `autonexabrasil.com.br` (y subdominios de tenant) |
| *Advanced Access* para el permiso `pages_messaging` | Obligatorio (App Review) |
| *Advanced Access* para `instagram_manage_messages` | Si se usa Instagram DM |

### Scopes solicitados en OAuth (ya en código, `src/lib/meta/graph.ts`)
```
pages_messaging, pages_manage_metadata, pages_show_list,
instagram_basic, instagram_manage_messages
```

### App Review (pasos)
1. **Productos → Messenger** → *Settings* → verificar que `pages_messaging` aparece con acceso avanzado.
2. **App Review → Permisos y funciones** → solicitar acceso avanzado a `pages_messaging` (+ `instagram_manage_messages` si aplica).
   - Justificación sugerida: *"La app permite a negocios locales atender a sus clientes por Messenger/Instagram DM con un asistente IA, respondiendo dudas sobre agendamiento y creando reservas."*
   - Incluir vídeo demo del flujo (conexión + respuesta automática).
3. En **App Review → Advanced Access**, la app solo puede usarse por usuarios con rol **Admin/Developer/Testers** mientras no se apruebe. Para lanzar con los 5 pilotos: añadirlos como **App Testers** mientras tanto.

### Webhooks (Productos → Messenger → Configuración → Webhooks)
- **Callback URL:** `https://autonexabrasil.com.br/api/meta/webhook` (UNA sola URL para todos los tenants — el tenant se resuelve por `page_id`/`instagram_id` del evento).
- **Verify token:** `META_WEBHOOK_VERIFY_TOKEN` (mismo valor en el código y en Meta).
- **Campos:** `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`, `instagram_messaging_events`.
- Verificación: botón *Verify and Save* → Meta hace GET con `hub.verify_token`; el servidor responde con el challenge (código: `src/app/api/meta/webhook/route.ts`).

### Renovación de page tokens (~60 días)
- Los `page_access_token` de `meta_connections` expiran ~60 días. **Pendiente de automatizar:** job diario que detecte `expires_at` próximo (ej. <15 días) y notifique al admin/profissional por push/email.
- Mientras tanto: reconectar manualmente el OAuth en `/admin/agent/[slug]` (renueva el token y re-inscribe el webhook).
- Alternativa manual para emergencias: Graph Explorer → `GET /me/accounts?access_token=<long-lived-token>` → copiar `access_token` de la página a la BD.

---

## 3. Google — Consent screen y dominios autorizados

### Google Cloud Console → APIs y servicios → Pantalla de consentimiento OAuth
| Requisito | Estado |
|---|---|
| Tipo de usuario: **Externo** (o Interno si la organización lo permite) | — |
| Dominio verificado en *Dominios autorizados* | `autonexabrasil.com.br` |
| URIs de redireccionamiento autorizadas | `https://autonexabrasil.com.br/api/google/callback` |
| Estados (Testing → In production) | **Modo Testing** permite máximo 100 usuarios; añadir a los 5 pilotos como *Usuarios de prueba* hasta pasar a producción |

### Scopes (ya en código, `src/lib/google/oauth.ts`)
```
https://www.googleapis.com/auth/calendar
openid
https://www.googleapis.com/auth/userinfo.email
```
> El scope `userinfo.email` + `openid` permite guardar `calendar_email` (mostrado en el painel). Cuentas conectadas antes de este cambio no tendrán email hasta reconectar.

### API habilitar
- **Google Calendar API** debe estar habilitada en el proyecto.

---

## 4. Verificación de webhooks (checklist final)

| Provedor | URL | Verify token | Firma |
|---|---|---|---|
| Meta (Messenger/IG DM) | `/api/meta/webhook` (GET verify + POST eventos) | `META_WEBHOOK_VERIFY_TOKEN` | HMAC SHA256 `X-Hub-Signature-256` (header) — `src/lib/webhook-firma.ts` |
| Meta (WhatsApp Cloud) | `/api/whatsapp/webhook` | mismo `META_WEBHOOK_VERIFY_TOKEN` (fallback `WHATSAPP_WEBHOOK_VERIFY_TOKEN`) | idem |
| Evolution (WhatsApp) | `/api/whatsapp/evolution/webhook` | header `x-webhook-secret` (se genera automáticamente en `createInstance`) | comparación del header |

### Pruebas sugeridas en go-live
1. **Meta:** abrir `GET /api/meta/webhook?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=123` → debe responder `123`; con token errado → 403.
2. **Meta POST:** enviar payload falso con firma inválida → 401; sin firma → 200 (debug) / 401 (producción, cuando `NODE_ENV=production` fuerza validación — ver `validarAssinaturaMeta`).
3. **WhatsApp Cloud:** template de prueba a un número propio → llega fuera de ventana 24h (valida template aprobado).
4. **Google:** conectar cuenta → painel `/admin/agent/[slug]` muestra `Conectado` + email.

---

## 5. Mercado Pago — PIX automático (Fase 5)

El sistema usa la **API HTTP directa de Mercado Pago** (sin SDK) para cobros PIX dinámicos:
QR dinámico (base64) + copia e cola, expiración de 30 min, webhook firmado con activación
automática del plan. Sin token configurado, el sistema cae al **Pix estático manual** actual
(no rompe nada).

### Configurar
1. Crear app en [Mercado Pago Developers](https://www.mercadopago.com.br/developers) (modo **Sandbox** para pruebas).
2. Copiar `Access Token` (`TEST-...` o `APP_USR-...`) → `.env.local`:
   - `MERCADOPAGO_ACCESS_TOKEN=TEST-...`
3. **Webhook:** Developers → Webhooks → crear webhook:
   - URL: `https://autonexabrasil.com.br/api/webhooks/mercadopago`
   - Evento: `payment`
   - Copiar el **Webhook Secret** generado → `MERCADOPAGO_WEBHOOK_SECRET=...`
   (también puede configurarse por pago: `notification_url` se envía automáticamente en cada cobro).
4. Aplicar la migración `supabase/migrations_gateway_pix.sql` (columnas `payment_id`, `pix_qr_code_base64`, `txid`, `pix_chave`, `expira_em` + índices).
5. Prueba: en `/painel/plano` → "Assinar com Pix" → el QR debe aparecer con aviso de expiración y "Já paguei — verificar". Pagar con un PIX de prueba de Sandbox → el plan se activa en <30s.

### Flujo automático (sin admin)
```
POST /api/planos/pedido ──► MP cria PIX dinâmico ──► pagamentos_pix (pendente, payment_id)
PIX pago ──► webhook MP (firma x-signature) ──► consulta estado real ──► extiende plano_expira_em (+1/+12 meses acumulativo) ──► push ✅
Fallback: GET /api/planos/pedido/estado (polling UI 10s) activa el plan si el webhook no llegó
```

### Job de vencimientos
`GET /api/planos/vencidos` (cron 03:00, header `Authorization: Bearer CRON_SECRET`): planes
vencidos → degrada a `gratis` + notifica por WhatsApp y push.

---

## 6. Variables de entorno involucradas
| Variable | Uso |
|---|---|
| `META_WEBHOOK_VERIFY_TOKEN` | Verify token único de webhooks Meta (recomendado; fallback `WHATSAPP_WEBHOOK_VERIFY_TOKEN`) |
| `META_APP_ID`, `META_APP_SECRET` | OAuth Meta + firma de webhooks |
| `META_REDIRECT_URI` | Opcional; default `${NEXT_PUBLIC_DOMAIN}/api/meta/callback` |
| `WHATSAPP_ACCESS_TOKEN` | Token de respaldo si la instancia no tiene `meta_access_token` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GOOGLE_REDIRECT_URI` | Opcional; default `${NEXT_PUBLIC_DOMAIN}/api/google/callback` |
| `NEXT_PUBLIC_DOMAIN` | Base URL pública (usada en redirects y callback URLs) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de la app Mercado Pago (PIX dinámico; ausente → fallback Pix manual) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret del webhook MP (firma `x-signature`; ausente → webhook rechazado con 401) |
