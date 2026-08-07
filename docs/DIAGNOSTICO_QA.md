# DIAGNÓSTICO QA + ESTADO DE REPARACIÓN — AN.BR

> **Documento vivo.** Cada ítem del diagnóstico tiene su estado de reparación. Se actualiza al terminar cada fase.
> Última actualización: 2026-08-06 — Fases 1–9 del plan de reparación.
> Ver también: `task_plan.md` (checklist ejecutable), `findings.md` (decisiones técnicas), `progress.md` (log de sesiones).

---

## 1. Descripción General del Producto

**AN.BR** es un SaaS de agendamiento con IA para profesionales de servicios (salones, clínicas, pet shops, autónomos, etc.). Propuesta de valor: página de agendamiento profesional en 5 minutos, IA que atiende WhatsApp 24/7, cobro por Pix y cero comisiones.

| Estado | Reparación |
|--------|-----------|
| ✅ Sin cambios | El mensaje es directo, resuelve un dolor real y el pricing es agresivo. |

---

## 2. Análisis de UX/UI

### 2.1 Lo que está bien ✅
| Aspecto | Estado |
|---------|--------|
| Propuesta de valor en el hero | ✅ Ok |
| Antes vs Después | ✅ Ok |
| Preguntas Frecuentes | ✅ Ok |
| Copywriting | ✅ Ok |
| Onboarding prometido | ✅ Ok |

### 2.2 Lo que preocupa (Fugas de UX) 🔴
| Problema del diagnóstico | Estado de reparación |
|--------------------------|----------------------|
| **Dashboard / Admin no accesible** (P0) | ✅ **REPARADO** — ruta `/demo` pública con painel mock interactivo (métricas, agenda, QR Pix, AI Agent, tour guiado) + `/admin` con pantalla "Área restrita" en vez de redirect silencioso |
| **Página de registro en blanco** (P0) | ✅ **REPARADO (matiz)** — el form SIEMPRE fue multi-paso completo (5 pasos); el analista no scrolleó. Mejora real aplicada: barra de progreso animada "Passo X de 5 · ~N min" + trust line bajo el CTA |
| **Dominio vs Marca** (P0) | ✅ **REPARADO en código** — `src/lib/site.ts`: dominio 100% configurable por `NEXT_PUBLIC_SITE_DOMAIN` (fallback autonexabrasil.com.br), 21 hardcodes centralizados. **Pendiente manual**: decidir dominio final + DNS + env var en Netlify |
| **Política de Privacidad y Términos** | ✅ Ok — existen en `/privacidade` y `/termos` (texto legal, quedan literales) |

---

## 3. Análisis de Funcionalidades

### 3.1 Prometido en el site
| Funcionalidad | Estado |
|---------------|--------|
| Página de agendamiento 24h | ✅ Demo real en home + `/demo` tab "Site do cliente" |
| AI Agent WhatsApp/Instagram/Facebook | ✅ Descrito + chat scripted en hero y `/demo` |
| Lembretes automáticos | ✅ Existen en código (cron + Meta/Evolution) |
| Pagamento via Pix | ✅ Modal Pix con QR en `/demo` + gateway Mercado Pago en código |
| Personalização de marca | ✅ Tab "Personalizar" en `/demo` (6 colores + 2 templates + preview al vivo) |
| Painel inteligente | ✅ Visible en `/demo` |
| Planos desde R$49 | ✅ Pricing home + `/precos` |
| 30 agendamentos grátis | ✅ Plan Grátis |

### 3.2 Lo que NO se podía validar
| Funcionalidad | Estado |
|---------------|--------|
| **Panel del Administrador** | ✅ **REPARADO** — `/demo` (painel mock interactivo) |
| **Flujo de agendamiento real** | ✅ Visual en home + `/demo`; el flujo end-to-end real requiere registro (inherente al producto; la demo lo cubre sin fricción) |
| **Conexión con WhatsApp / AI Agent** | 🟡 Chat scripted (hero + `/demo`); **pendiente** endpoint público real con tenant demo (`DEMO_TENANT_ID`) |
| **Integración con Pix** | ✅ Modal Pix con QR + copia-e-cola en `/demo` |
| **Personalización de marca** | ✅ **REPARADO** — editor interactivo con preview al vivo en `/demo` |

---

## 4. Análisis de Monetización

| Aspecto | Estado |
|---------|--------|
| Freemium 30/mês | ✅ Ok |
| Plan pago R$49 | ✅ Ok |
| Zero comissão | ✅ Ok |
| "Cancele quando quiser" | ✅ Ok |
| Riesgo: plan grátis demasiado generoso | ⚠️ Decisión de negocio (no es bug). El upgrade se justifica con AI Agent/WhatsApp/dominio (ya así en `/precos`) |

---

## 5. Análisis Técnico y Performance

| Aspecto | Estado |
|---------|--------|
| SSL/HTTPS | ✅ Ok (Netlify) |
| Rutas rotas `/admin` y `/login` | ✅ **REPARADO** — `/login` redirige a `/entrar`; `/admin` gate con pantalla restringida |
| Formulario de registro | ✅ **REPARADO** — progreso visual (ver 2.2) |
| Performance | ✅ Build 72/72 rutas, tipo check limpio, tests 24/24 |

---

## 6. Análisis de Competencia

| Estado | Nota |
|--------|------|
| ✅ Sin cambios | Diferenciador real: AI Agent + zero comissão + 5 min. Se mantiene |

---

## 7. Tabla Resumen Fortalezas/Debilidades

| 🔴 Debilidad del diagnóstico | Estado |
|------------------------------|--------|
| Dashboard no visible | ✅ `/demo` |
| Marca vs dominio confusos | ✅ Código listo (env); ⏳ decisión de negocio |
| No se puede testear sin registrarse | ✅ `/demo` sin auth |
| Registro en blanco | ✅ Progreso visual (form ya era completo) |
| Faltan testimonios | ✅ Depoimentos reales desde BD (fallback honesto: se ocultan si no hay) |
| No hay demo del AI Agent | 🟡 Scripted hecho; real pendiente (env DEMO_TENANT_ID) |

---

## 8. Recomendaciones Estratégicas (Priorizadas)

| # | Recomendación | Estado |
|---|---------------|--------|
| **P0-1** | Demo del Dashboard | ✅ **REPARADO** — `/demo` con 4 tabs (Painel, Site do cliente, AI Agent, Personalizar) + tour guiado |
| **P0-2** | Unificar marca y dominio | ✅ Código env-driven (`src/lib/site.ts`, `proxy.ts` usa `SITE_DOMAIN`). ⏳ **Manual**: DNS + `NEXT_PUBLIC_SITE_DOMAIN` en Netlify + editar termos/privacidade si cambia el dominio |
| **P0-3** | Corregir rutas rotas | ✅ **REPARADO** — `/login` → `/entrar` |
| **P1-4** | Mejorar página de registro | ✅ **REPARADO** — barra de progreso + "Passo X de 5 · ~N min" + trust line |
| **P1-5** | Añadir video demo | ⏳ **Manual/futuro** — asset de video 30-60s (outcome-led); mientras tanto la demo interactiva cubre |
| **P1-6** | Testimonios/casos de éxito | ✅ **REPARADO** — `Depoimentos.tsx` (avaliacoes reales aprobadas, media estrellas, antes del pricing; se oculta si vacío). ⏳ Solicitar depoimentos a pilotos para llenar la sección |
| **P2-7** | Chat "Fale com nosso AI Agent" | 🟡 **REPARADO parcial** — `ChatDemo.tsx` scripted en hero + chat scripted en `/demo`. ⏳ Endpoint público real: `/api/demo/chat` + env `DEMO_TENANT_ID` |
| **P2-8** | Ejemplos de personalización | ✅ **REPARADO** — tab "Personalizar" en `/demo` (preview al vivo) |
| **P2-9** | Sección de Planos clara | ✅ **Ya existía** — `/precos` con 3 planes + comparativa de features + FAQ; home con 3 columnas y badge MAIS POPULAR (el analista no scrolleó) |
| **P2-10** | Métricas de impacto reales | ✅ **REPARADO** — stats bar existente (5 min/30/40%/24h) + nuevo componente de adopción real (profissionais ativos + agendamentos realizados) con fallback honesto; se muestra solo cuando hay datos suficientes |

---

## 9. Conclusión Final

El diagnóstico original decía: "el site no permite probar el producto antes de registrarse → barrera de conversión crítica". **Esa barrera está eliminada**: `/demo` muestra painel, booking, AI Agent, Pix y personalización sin registro.

Restan solo **acciones manuales** (no código):
1. Decidir dominio final → fijar env vars en Netlify + DNS
2. Video demo corto (asset de marketing)
3. Endpoint chat AI público real con tenant demo (env `DEMO_TENANT_ID`)
4. Solicitar depoimentos reales a pilotos
5. Meta App Review (templates) + Google OAuth producción (go-live, ver `docs/GO_LIVE.md`)

---

## 10. Matices — dónde el analista NO tenía toda la información

| Crítica del diagnóstico | Realidad en código |
|-------------------------|--------------------|
| "Formulario de registro en blanco / solo muestra categoría" | El form es un flujo de 5 pasos completo (categoría → servicios → datos → WhatsApp → revisión); el contenido estaba debajo del fold sin indicador de progreso |
| "Faltan sección de Planos" | `/precos` tiene 3 planes con comparativa feature-by-feature + tabla comparativa + FAQ; home tiene pricing 3 columnas |
| "Sin métricas de impacto" | Stats bar existe (5 min / 30/mês / 40% menos faltas / 24h AI); faltaba adopción real → añadido |
| "Chat AI no funcional" | El chat real exige auth + plan + API key OpenAI del tenant (por diseño). El público NO puede usar el chat real sin un tenant demo dedicado — deuda documentada |
| "Dashboard no accesible" | Era un bug real (no demo pública) → reparado con `/demo` |
| "Marca vs dominio" | Es decisión de negocio + ahora el código está 100% listo para cambiar el dominio con 1 env var |

---

## Checklist de estado (mantener al día)
- [x] P0-1 Demo dashboard (`/demo`)
- [x] P0-2 Dominio env-driven (falta decisión DNS)
- [x] P0-3 Rutas `/login` y `/admin`
- [x] P1-4 Cadastro con progreso
- [ ] P1-5 Video demo (manual)
- [x] P1-6 Depoimentos reales
- [ ] P2-7 Chat AI real público (falta infra/env)
- [x] P2-8 Editor personalización en demo
- [x] P2-9 Planos (ya existía)
- [x] P2-10 Métricas de adopción reales
