# MIGRACIÓN A CLOUDFLARE — ESTADO (2026-08-07)

> Documento vivo: actualizar al avanzar. Último estado: repo configurado + workflow GitHub Actions listo; pendiente: limpieza del dashboard, secrets y deploy.

## 📌 POR QUÉ MIGRAMOS

Netlify Free pasó a sistema de **créditos (300/mes, ~20 deploys)** → bloquea production deploys
cada ciclo. Vercel Hobby tiene cláusula "no commercial" (riesgo de cancelación) y timeout de
funciones 60s. **Cloudflare Workers**: gratis, builds ilimitados, 100K requests/día,
bandwidth ilimitado, **sin TOS comerciales** → no puede cancelar por vender.

## 🏗️ ARQUITECTURA OBJETIVO (TODO EN CLOUDFLARE, LIMPIO)

```
registrar.com.br (registrador — NS apunta a Cloudflare)
  └── Zona DNS: autonexabrasil.com.br   (1 sola zona, en Cloudflare)
        └── CNAME @ , www , * → Worker `anbr` (autogestionado por "Custom Domains")
              └── Worker `anbr` = Next.js 16 via @opennextjs/cloudflare
                    ├── Env vars no secretas → [vars] en wrangler.toml
                    ├── Secrets → dashboard del worker (Settings → Variables)
                    ├── Cron Triggers: lembretes 12:00 / vencidos 03:00
                    └── Auto-deploy: GitHub Actions (workflow del repo)

Netlify → se mantiene VIVO (DNS viejo) hasta verificar Cloudflare, luego baja
GitHub → repo publica en main → workflow build+deploy → worker anbr
```

**Decisiones tomadas:**
- **Workers, NO Pages**: el adaptador oficial `@opennextjs/cloudflare` y la doc de Next.js 2026
  recomiendan Workers. Pages solo sirve estáticos. Cualquier proyecto Pages creado en el
  dashboard (intento previo conectando GitHub) se ELIMINA.
- **Auto-deploy: GitHub Actions** (no Workers Builds): build en Linux (evita el bug de
  bundling de Windows), reproducible, secrets en GitHub.
- **Netlify vivo** hasta que `https://autonexabrasil.com.br` responda OK desde Cloudflare.

## ✅ YA HECHO (validado)

### 1. Toolchain instalado
- `@opennextjs/cloudflare@1.20.2` + `wrangler@4.120.0` como devDependencies
  (adaptador oficial de Cloudflare para Next.js 16)

### 2. Archivos de configuración creados
| Archivo | Propósito |
|---|---|
| `open-next.config.ts` | Config del adaptador: wrapper `cloudflare-node`, converter `edge`, middleware external, `edgeExternals: ["node:crypto"]`, caches dummy |
| `wrangler.toml` | Worker `anbr`, `main = ".open-next/worker.js"`, `compatibility_date = "2024-09-23"`, flags `nodejs_compat`, binding `ASSETS` |
| `.gitignore` | + `/.open-next/`, `/.wrangler/`, `/.dev.vars` (protección de secrets) |

### 3. DOS BUGS REALES ARREGLADOS EN EL CÓDIGO (importantes para TODO deploy futuro)

**Bug 1 — middleware forzaba Node.js runtime (incompatible con Cloudflare):**
- `src/proxy.ts` usaba `createServerClient` de `@supabase/ssr` → Node-only
- **Fix**: reemplazado por `fetch` directo a la REST API de Supabase
  (`/rest/v1/custom_domains` + `/rest/v1/profissionais`) con headers `apikey`/`Authorization`
- Mismo comportamiento, edge-compatible, más ligero
- CACHE: `CUSTOM_DOMAIN_CACHE` (Map) conservado

**Bug 2 — Next 16 Proxy corre SIEMPRE en Node.js (doc oficial):**
- "Proxy defaults to the Node.js runtime. The `runtime` config option is not available
  in Proxy files" (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md)
- OpenNext no soporta Node.js middleware (solo edge)
- **Fix**: `git mv src/proxy.ts src/middleware.ts` + función renombrada a `middleware`
  (convención anterior, soportada en Next 16 con warning de deprecación)
- NINGÚN archivo importa proxy.ts (auto-registro por convención) — no rompió nada

### 4. BUILD DEL WORKER: ✅ PASÓ
```
npx opennextjs-cloudflare build
→ Worker saved in `.open-next/worker.js` 🚀
→ OpenNext build complete.
```
- TSC: 0 errores
- Config del validador (`ensure-cf-config.js`) exige EXACTAMENTE:
  - default.override: wrapper=cloudflare-node, converter=edge, proxyExternalRequest=fetch, incrementalCache/tagCache/queue (dummy|direct|function)
  - edgeExternals: ["node:crypto"]
  - middleware: external=true + override wrapper=cloudflare-edge, converter=edge, proxyExternalRequest=fetch, caches dummy

### 5. PRUEBAS LOCALES (wrangler dev, puerto 8787)
- ✅ API routes responden real: `/api/health` → 401 (pide token), `/api/agendamentos` → 400 (valida params)
- ⚠️ PÁGINAS (/, /login, /dogdaycare-br, /reservar) → 404 en Windows:
  - Causa 1 (ya fixeada): hostname `127.0.0.1` no estaba en la whitelist del middleware →
    trataba el host local como dominio custom → agregado `127.0.0.1` al check
  - Causa 2 (PENDIENTE DE VALIDAR): error de bundling en Windows de wrangler —
    `Could not resolve "./.build/durable-objects/queue.js"` (los archivos EXISTEN en
    `.open-next/.build/durable-objects/`) — problema conocido de OpenNext en Windows
    (avisa "not fully compatible with Windows, use WSL")

## 🔜 PLAN DE EJECUCIÓN (en orden)

### Paso 1 — Limpiar el dashboard de Cloudflare (manual, ~10 min)
1. **Workers & Pages** (dash.cloudflare.com → Workers & Pages):
   - Borrar TODOS los proyectos **Pages** (el sitio viejo y el intento reciente con GitHub).
     ⚠️ Solo se borran proyectos/hosts, NO los DNS de la zona — seguro.
   - Borrar cualquier **Worker viejo** que sobre (web anterior). El worker `anbr`
     se creará solo en el primer deploy.
2. **Zonas** (dash.cloudflare.com → Your profile → Domains / Add zone):
   - Verificar que exista EXACTAMENTE UNA zona `autonexabrasil.com.br`.
   - Si hay duplicadas → eliminar las extra.
   - Si NO existe ninguna → crearla (plan Free) y en registrar.com.br apuntar los
     NS del dominio a los NS de Cloudflare que indica la zona.
3. **DNS de la zona** (antes del cutover): los registros actuales apuntan a Netlify
   (CNAME → *.netlify.app o similar). NO borrarlos aún: se reemplazarán en el Paso 6.

### Paso 2 — Secrets de GitHub (manual, ~5 min)
GitHub → repo → Settings → Secrets and variables → Actions → New repository secret:
`CLOUDFLARE_API_TOKEN` (dash → My Profile → API Tokens → Create Token → template
"Edit Cloudflare Workers") y `CLOUDFLARE_ACCOUNT_ID` (sidebar derecha del dashboard).
Luego TODAS las demás variables de `.env.local` (mismos nombres), incluidos
`NEXT_PUBLIC_*` (build-time) y las server-side. El workflow
`.github/workflows/deploy-cloudflare.yml` ya mapea todas.

### Paso 3 — Secrets del worker (manual, 1 vez — persisten entre deploys)
Worker `anbr` → Settings → Variables and Secrets → Add → (Secret), o por CLI:
```
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put CRON_SECRET
... (OPENAI_API_KEY, GOOGLE_CLIENT_ID/SECRET, META_APP_ID/SECRET,
     WHATSAPP_ACCESS_TOKEN, WHATSAPP_WEBHOOK_VERIFY_TOKEN, META_WEBHOOK_VERIFY_TOKEN,
     VAPID_PRIVATE_KEY, VAPID_CONTACT, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY)
```
No secretas ya en `wrangler.toml [vars]`: `SITE_DOMAIN`, `NODEJS_COMPAT_DATE`.

### Paso 4 — Deploy (git push a main)
```
git add -A && git commit -m "feat: Cloudflare Workers CD (GitHub Actions) + crons" && git push
```
→ GitHub Actions corre `npx opennextjs-cloudflare build` (Linux) + `npx wrangler deploy`
→ worker `anbr` creado. Verificar en Workers & Pages → anbr → el deployment.

### Paso 5 — Dominio en el worker
Worker `anbr` → Settings → Domains & Routes → Add custom domain:
`autonexabrasil.com.br` y `www.autonexabrasil.com.br` (Cloudflare crea los CNAME
automáticamente). Si se quieren subdominios tipo `slug.autonexabrasil.com.br`,
agregar también un CNAME `*` manual apuntando a `anbr.<ACCOUNT>.workers.dev`.

### Paso 6 — Cutover DNS + verificación
1. En la zona, reemplazar los registros hacia Netlify por los que creó Cloudflare
   en el Paso 5 (o usar el toggle DNS-only/Proxy — DNS-only si Netlify aún responde).
2. Verificar: `https://autonexabrasil.com.br` (home), `/login`, un slug (`/dogdaycare-br`),
   `/reservar`, y una API (`/api/health` → 401 esperado).
3. Probar los 2 crons manualmente con `Authorization: Bearer $CRON_SECRET`.
4. Test end-to-end: crear un agendamiento real en un slug.

### Paso 7 — Baja de Netlify
1. Netlify → Site → Settings → Danger Zone → Delete site.
2. Guardar nada más — el código ya está en GitHub.

### Paso 8 — Post-migración
- [ ] Meta App Review: actualizar whitelist de URLs del webhook → `https://autonexabrasil.com.br/api/...`
- [ ] Google OAuth: redirect URI ya apunta al dominio (env `GOOGLE_REDIRECT_URI`)
- [ ] Backup plan (deploy/): Dockerfile + compose + Caddyfile + GH Actions listos para VPS

## 🧠 LECCIONES APRENDIDAS

- **Netlify Free 2026**: créditos, no build minutes. 300/mes ≈ 20 deploys. Bloquea cada ciclo.
- **Next 16**: `proxy.ts` = middleware renombrado, corre en Node por defecto y no admite
  `runtime` config → para edge (Cloudflare) usar convención `middleware.ts`
- **Supabase en edge/middleware**: NO usar `@supabase/ssr` en middleware → `fetch` directo a REST
- **OpenNext Windows**: build funciona, pero `wrangler dev` local puede fallar al resolver
  Durable Objects — usar deploy directo (Linux) o WSL para probar local
- **Comandos útiles**:
  - Build: `npx opennextjs-cloudflare build`
  - Dev local: `npx wrangler dev --port 8787` (usa `.dev.vars` como env)
  - Deploy: `npx wrangler deploy`
