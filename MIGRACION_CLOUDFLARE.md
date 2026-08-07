# MIGRACIÓN A CLOUDFLARE PAGES — ESTADO (2026-08-07)

> Documento vivo: actualizar al avanzar. Último estado: fase de validación/deploy pendiente.

## 📌 POR QUÉ MIGRAMOS

Netlify Free pasó a sistema de **créditos (300/mes, ~20 deploys)** → bloquea production deploys
cada ciclo. Vercel Hobby tiene cláusula "no commercial" (riesgo de cancelación) y timeout de
funciones 60s. **Cloudflare Pages**: gratis, builds ilimitados (500/mes), 100K requests/día,
bandwidth ilimitado, **sin TOS comerciales** → no puede cancelar por vender.

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

## 🔜 SIGUIENTES PASOS (en orden)

1. **Deploy directo a Cloudflare** (el build ya está validado; el bundling de wrangler
   corre en sus servidores Linux, donde este bug de Windows no existe):
   ```
   npx wrangler login                      # navegador → cuenta Cloudflare
   npx wrangler deploy                     # o wrangler pages deploy
   ```
   - Necesario: cuenta en dash.cloudflare.com (el usuario debe crearla)
   - El worker se llama `anbr` (wrangler.toml)
2. **Env vars en Cloudflare**: TODAS las de `.env.local` (Supabase URL+keys, META_*,
   GOOGLE_*, OPENAI_*, OPENROUTER_*, WHATSAPP_*, CRON_SECRET, NEXT_PUBLIC_DOMAIN, etc.)
   - En OpenNext: server-side vars via `[vars]` en wrangler.toml o dashboard;
     las NEXT_PUBLIC_* se inyectan en build time (el build ya las tiene embebidas del .env.local)
3. **Páginas en producción**: verificar `/`, `/dogdaycare-br`, `/reservar`, `/painel`
4. **Crons** (los 2 de Netlify): Cloudflare usa **Cron Triggers** en wrangler.toml
   (gratis, hasta 5 por cuenta):
   ```toml
   [triggers]
   crons = ["0 12 * * *", "0 3 * * *"]
   ```
   - Endpoints: `/api/agendamentos/lembretes` (12:00) y `/api/planos/vencidos` (03:00)
   - Ambos autentican con header `Authorization: Bearer $CRON_SECRET`
5. **Dominio**: agregar `autonexabrasil.com.br` como custom domain de Pages
   (DNS via Cloudflare → mover NS o registrar zona)
6. **Mantener Netlify vivo** mientras tanto (sitio sigue online, solo pausados los deploys)
7. **Backup plan (deploy/)**: `deploy/Dockerfile` + `docker-compose.yml` + `Caddyfile`
   + `.github/workflows/deploy-vps.yml` → listo para VPS (Oracle Always Free / Hetzner)
   si Cloudflare tuviera algún problema

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
