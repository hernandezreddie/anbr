# 🔒 Seguridad QA — AutoNexaBrasil.com.br

> **Última actualización:** 2026-08-07  
> **Commit de correcciones:** `e88bbdf`  
> **Estado:** ✅ **CORRECCIONES APLICADAS** | Verificado: typecheck 0 errores, 24/24 tests, 74 rutas build

---

## 📊 Resumen Ejecutivo

| Criterio | Puntuación |
|----------|-----------|
| Seguridad aplicación | **6.1 / 10** → **Corregida** ✅ |
| Multi-tenancy / Aislamiento | **8 / 10** ✅ |
| Pago / Lógica financiera | **7 / 10** ✅ |
| Performance / DB | **5 / 10** (debilidades documentadas) |
| Cumplimiento LGPD | **4 / 10** (acciones manuales pendientes) |
| SEO / Metadatos | **7 / 10** ✅ |

---

## 🔴 P0 — Bloqueadores Críticos (CORREGIDOS)

### 1. IDOR en `is_admin_or_owner()` (Módulo 1.1)
**Archivo:** `supabase/schema_completo.sql:1005`, `supabase/migrations_planos.sql:74-86`

**Riesgo:** La función original permitía `role IN ('owner', 'admin')`, permitiendo a cualquier `owner` de un tenant leer perfiles de otros tenants.

**Corrección aplicada:**
```sql
-- Antes (VULNERABLE):
AND role IN ('owner', 'admin')

-- Después (CORRECTO):
AND role = 'admin'
```

**Verificado en:** `migrations_planos.sql` (aplicado antes que `migrations_fix_all.sql` en orden alfabético).

---

### 2. Filtración de errores DB (Módulo 4.2)
**Archivos afectados y corregidos:**
| Archivo | Línea corregida |
|---------|----------------|
| `src/app/api/admin/tenant/route.ts` | Línea 64, 66, 89-90, 106-108 |
| `src/app/api/config/atualizar/route.ts` | Línea 35 |
| `src/app/api/agendamentos/[id]/status/route.ts` | Línea 40 |
| `src/app/api/agent/chat/route.ts` | Línea 60, 65, 128-133 |
| `src/app/api/webhooks/mercadopago/route.ts` | Línea 85 |

**Cambio aplicado:**
```typescript
// ANTES (expone información interna):
return Response.json({ error: error.message }, { status: 500 });

// DESPUÉS (mensaje genérico + log interno):
console.error("[tag] Error detail:", error);
return Response.json({ error: "Erro interno" }, { status: 500 });
```

---

### 3. Validación de inputs en `/api/cadastro` (Módulo 4.2)
**Archivo:** `src/app/api/cadastro/route.ts`

**Riesgo:** Sin validación server-side, un atacante podría enviar datos maliciosos (email inválido, slug con caracteres especiales, etc.).

**Corrección aplicada:**
```typescript
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/i),
  senha: z.string().min(6),
  consentimento: z.boolean().refine((val) => val === true),
  // ... otros campos
});
```

---

### 4. Sanitización XSS en agendamentos (Módulo 4.2)
**Archivo:** `src/app/api/agendamentos/route.ts:11-17`

**Función nueva:**
```typescript
const sanitizeTexto = (txt: string | undefined | null): string => {
  if (!txt) return "";
  return txt
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .slice(0, 500);
};
```

**Aplicado a:** `cliente_nome`, `cliente_endereco`, `observacoes`

---

### 5. Cookies de sesión (Módulo 1.2)
**Archivo:** `src/lib/supabase/server.ts:16-24`

**Riesgo:** `setAll()` estaba vacío, imposibilitando logout y usando cookies sin seguridad.

**Corrección aplicada:**
```typescript
setAll(cookiesToSet) {
  try {
    for (const { name, value, options } of cookiesToSet) {
      cookieStore.set(name, value, {
        ...options,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  } catch {
    // Called from Server Component — can be ignored on middleware refresh.
  }
},
```

---

## 🟡 P1 — Alto Riesgo (CORREGIDOS)

### 6. Índices faltantes (Módulo 4.1)
**Archivo:** `supabase/migrations_avaliacoes.sql`

**Corrección aplicada:**
```sql
CREATE INDEX IF NOT EXISTS idx_avaliacoes_token ON avaliacoes(token);
CREATE INDEX IF NOT EXISTS idx_agendamentos_token_avaliacao ON agendamentos(token_avaliacao);
```

**Policy de DELETE agregada:**
```sql
DROP POLICY IF EXISTS "avaliacoes_admin_delete" ON avaliacoes;
CREATE POLICY "avaliacoes_admin_delete" ON avaliacoes
  FOR DELETE TO authenticated
  USING (public.is_admin_or_owner() OR (
    SELECT profissional_id FROM profiles WHERE id = auth.uid()
  ) = profissional_id);
```

---

## 🟢 P2 — Mejoras (Documentadas)

| # | Hallazgo | Estado |
|---|----------|--------|
| 1 | Rate limiting en memoria (best-effort serverless) | 🟢 OK — documentado limitación multi-instancia |
| 2 | Validación inputs inconsistente | 🟡 Documentado — Zod aplicado en cadastro, validation manual en otros |

---

## 🛡️ Medidas de Seguridad Existentes

### Middleware (`src/middleware.ts`)
- ✅ CSRF validation (Origin/Referer check en POST/PATCH/DELETE)
- ✅ Whitelist webhooks: `/api/webhooks/*`
- ✅ Whitelist crons: `/api/agendamentos/lembretes`, `/api/planos/vencidos`
- ✅ Headers de seguridad: `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Permissions-Policy`
- ✅ CSP configurado en `next.config.ts`

### RLS (Row Level Security)
- ✅ Habilitado en TODAS las tablas críticas
- ✅ Políticas por tenant en: `profissionais`, `configuracoes`, `servicos`, `clientes`, `agendamentos`, `pagamentos`, `agent_configs`, etc.
- ✅ Función `is_admin_or_owner()` restringida a `role = 'admin'`
- ✅ Anon policies limitadas a SELECT de datos públicos

### Webhooks
- ✅ Evolution API: validación `x-webhook-secret` con `crypto.timingSafeEqual`
- ✅ Meta: validación `X-Hub-Signature-256` (HMAC SHA256)
- ✅ Mercado Pago: validación `x-signature`

### Autenticación
- ✅ Todas las APIs críticas usan `verificarAcessoProfissional()`
- ✅ Admin routes verifican `isAdminPlataforma()`
- ✅ Planos verificados server-side (`exigirPlano`)

---

## ⚠️ Pendientes (Acciones Manuales)

| # | Acción | Responsable |
|---|--------|-------------|
| 1 | Google OAuth consent screen → modo producción con dominio verificado | Usuario |
| 2 | Meta App Review → templates `confirmacao_agendamento`, `lembrete_agendamento`, `convite_avaliacao` | Usuario |
| 3 | Endpoint chat AI público para `/demo` (tenant demo whitelisted + env `DEMO_TENANT_ID`) | Usuario |
| 4 | Rotar credenciales: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `VAPID_PRIVATE_KEY` | Usuario |
| 5 | LGPD "Right to be forgotten" — implementar endpoint de borrado de datos personales | Falso |

---

## 📋 Checklist de Verificación

- [x] `npm run typecheck` → 0 errores
- [x] `npm run test` → 24/24 tests pass
- [x] `npm run build` → 74 rutas construidas
- [x] IDOR corregido en `is_admin_or_owner()`
- [x] Error leakage sanitizado en 5 endpoints
- [x] Zod validation en `/api/cadastro`
- [x] Cookie `setAll` implementado con flags de seguridad
- [x] Índices DB agregados + política DELETE
- [x] Sanitización XSS en agendamentos
- [ ] Google OAuth producción (manual)
- [ ] Meta App Review (manual)
- [ ] Chat público demo (manual)
