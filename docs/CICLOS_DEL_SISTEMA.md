# CICLOS DEL SISTEMA — AN.BR

**Versión:** 2.0 · **Fecha:** 2026-08-05 · **Estado:** PRODUCCIÓN

---

## Índice
1. [Ciclo 1 — Captación del Profesional](#1-captación-del-profesional)
2. [Ciclo 2 — Booking del Cliente](#2-booking-del-cliente)
3. [Ciclo 3 — Operación Diaria (Painel)](#3-operación-diaria-painel)
4. [Ciclo 4 — Pagos y Planes](#4-pagos-y-planes)
5. [Ciclo 5 — Automatización (Crons)](#5-automatización-crons)
6. [Ciclo 6 — AI Agent (24/7)](#6-ai-agent-247)
7. [Ciclo 7 — Marketing y Crecimiento](#7-marketing-y-crecimiento)
8. [Mejoras Recomendadas a Ciclos Existentes](#mejoras-a-ciclos-existentes)
9. [Nuevos Ciclos Propuestos (Mercado 2026)](#nuevos-ciclos-propuestos)
10. [Priorización y Roadmap](#priorización-y-roadmap)

---

## 1. Captación del Profesional

**Flujo:** Homepage → Cadastro (5 pasos) → Sucesso → Dashboard

```
Paso 1: Categoría (13 nichos con templates pre-armados)
Paso 2: Datos personales (nombre, email, WhatsApp, contraseña)
Paso 3: Endereço (ciudad, barrio — opcional)
Paso 4: Serviços (pre-cargados por categoría, editables)
Paso 5: Finalizar → Landing page activa en <5 min
```

**Estado:** ✅ Funcional
- Templates por 13 nichos (limpeza, beleza, unhas, saúde, clínica, personal, automotivo, veterinário, artes, gastronomia, fotografia, consultoria, outro)
- Servicios, frecuencias y adicionales pre-cargados
- LGPD consent integrado
- Rate limit 3 registros/min
- Success page con credenciales + QR + guía "cómo usar"

---

## 2. Booking del Cliente

**Flujo:** Landing prestador → Reservar (6 pasos) → Confirmación WhatsApp → Agendamento en BD

```
Paso 1: Serviço (selección con precios y descripciones)
Paso 2: Data/Hora (date picker con disponibilidad real)
Paso 3: Cômodos (solo categoría limpeza — opcional)
Paso 4: Adicionais (extras con precios)
Paso 5: Frequência (pontual, semanal, quinzenal, mensal — descuentos)
Paso 6: Seus Dados (nombre, WhatsApp, dirección) → Confirmar
```

**Estado:** ✅ Funcional
- Server-side recalculo de precio (`estimar()`) — inmune a manipulación
- Validación de conflicto por solapamiento de duración
- Límite diario configurable por profesional
- Plano grátis: cota 30 agendamentos/mes
- Confirmación WhatsApp automática al profesional + cliente
- Push notification al painel
- Deep links `?step=` funcionales
- LGPD consent integrado

---

## 3. Operación Diaria (Painel)

**Flujo:** Dashboard → Confirmar/Cancelar/Concluir → Cobrar Pix → Marcar Pago → Histórico

**Secciones del Dashboard:**
1. Header con saudação + fecha
2. UpgradeBanner (si plan grátis)
3. OnboardingWizard (4 pasos para nuevos)
4. Stats Grid (ganho mês, a receber, próximos 7 dias, rota)
5. DashboardCharts (faturamento mensal, taxa ocupação, faltas %, ticket médio, leads IA)
6. InsightCard (sugerencias proactivas)
7. Ações (próximos passos: confirmar, lembrete, receber, retorno)
8. Solicitações (nuevas reservas pendientes)
9. Amanhã (agendamentos del día siguiente)
10. Agendados (confirmados)
11. Histórico (concluidos + cancelados)

**Estado:** ✅ Funcional
- Realtime updates vía Supabase subscriptions
- Acciones rápidas: Confirmar, Concluir, Cancelar, Marcar Pago, Cobrar Pix
- Mensajes pre-armados por categoría (confirmación, lembrete, cobrança, etc.)
- Links: Mapa, Ônibus, Ligar, Agenda (Google Calendar)
- QR Pix dinámico por agendamento
- Edición inline de fecha/hora

**Sidebar/BottomNav:**
- Início, Agenda, Calendário, Clientes, Mais (Perfil, Ofertas, Avaliações, QR, AI Agent, Plano, Como usar)

---

## 4. Pagos y Planes

**Planes:**
| Plan | Precio | Features |
|------|--------|----------|
| Grátis | R$ 0/mês | 30 agendamentos, página, confirmación WA |
| Profissional | R$ 49/mês | Todo Grátis + AI Agent + Google Calendar + dominio propio + relatórios |
| IA Premium | R$ 99/mês | Todo Profissional + WhatsApp API oficial + AI Ads |

**Flujo de pago:**
```
Reserva → Pix dinámico (Mercado Pago) → QR + copia e cola
→ Webhook MP confirma → Plan activado automáticamente (<30s)
→ Fallback: polling cada 10s + botón "Já paguei — verificar"
```

**Estado:** ✅ Funcional
- Gateway Mercado Pago (Pix dinámico con expiración 30 min)
- Firma HMAC SHA256 en webhook + consulta estado real vía API
- Renovaciones acumulativas (1 o 12 meses)
- Sin MERCADOPAGO_ACCESS_TOKEN → fallback a Pix estático manual
- Job diario: planes vencidos → degradar a gratis + notificar
- Push notification al confirmar pago

---

## 5. Automatización (Crons)

**Jobs programados:**
```
12:00 diario → Lembretes WhatsApp (día anterior + mismo día)
03:00 diario → Planes vencidos → degradar a gratis + notificar
Al concluir → Dispara convite de avaliação automático
Vencido 24h+ → Auto-concluir + enviar convite
```

**Estado:** ✅ Funcional
- `processarLembretesGlobais()` itera todos los profesionales
- CRON_SECRET protege los endpoints
- Template Meta + fallback texto libre
- Columnas `msg_lembrete_enviado` y `msg_lembrete_mesmo_dia_enviado`

---

## 6. AI Agent (24/7)

**Canales:** WhatsApp, Instagram, Facebook

**Flujo:**
```
Cliente escribe → AI Agent responde → Verifica disponibilidad → Agenda solo
→ Conversación guardada en painel → Profesional puede revisar/responder
```

**Capacidades:**
- Responde dudas sobre servicios, precios, horarios
- Verifica disponibilidad real (consulta BD)
- Crea agendamiento directo (tool `criar_agendamento`)
- Multi-proveedor: OpenAI, OpenRouter (DeepSeek, etc.), Anthropic (Claude), Gemini
- RAG con documentos subidos por el profesional
- Cota de mensajes por plan
- Rate limit 10 msg/min por conversación

**Estado:** ✅ Funcional
- Tools: consultar_agendamentos, verificar_disponibilidade, criar_agendamento, consultar_servicos
- Multi-idioma (portugués principal)
- Diagnóstico de conexión en painel
- Tokens y costos trackeados en `agent_usage`

---

## 7. Marketing y Crecimiento

**Herramientas:**
- **QR Code** — imprimible, escaneable por cliente para agendar directo
- **Link compartible** — `/[slug]/reservar` para bio de Instagram, status WA, Facebook
- **AI Ads** — generador de copys para Meta Ads
- **Landing page** — optimizada CRO + SEO + schema.org

**AI Ads (MVP):**
```
4 objetivos: Mais agendamentos, Mais seguidores, Promoção, Recuperar clientes
→ Brief automático (servicios, ubicación, ticket médio)
→ 5 headlines + 5 descripciones + CTAs
→ Segmentación sugerida (9 categorías con intereses, edad, género)
→ Presupuesto estimado (diario, total, CPC)
→ 5 dicas por campaña
→ Copy-to-clipboard para pegar en Meta Ads manualmente
```

**Estado:** ✅ Funcional
- AI Ads engine completo (`src/lib/ai/ads.ts`)
- UI en `/painel/ads`
- Templates por objetivo
- Segmentación por categoría
- Google Maps link integrado en landing
- Schema.org FAQ + SoftwareApplication
- Sitemap.xml + robots.txt

---

## Mejoras a Ciclos Existentes

### C1 — Captación: Pre-cadastro via WhatsApp
**Problema:** Muchos profesionales abandonan el formulario de 5 pasos.
**Solución:** Botón "Criar meu sistema" en el WhatsApp Float de la homepage → el AI Agent hace el pre-cadastro por chat (nombre, categoría, ciudad) → link mágico para completar.
**Impacto:** Alto (reduce fricción de entrada, Brasil es WhatsApp-first).
**Esfuerzo:** Medio (integrar tool de cadastro al AI Agent).

### C2 — Booking: Upsell Inteligente
**Problema:** El cliente solo ve el servicio que seleccionó.
**Solución:** En el paso de servicios, mostrar "Clientes que contrataram X também contrataram Y" o "Adicione Z por apenas R$ 15 a mais". Basado en datos reales de agendamientos del profesional.
**Impacto:** Alto (aumenta ticket médio 15-30%).
**Esfuerzo:** Bajo (datos ya existen en BD, solo UI + lógica de sugerencia).

### C3 — Booking: Booking por Voz/Áudio
**Problema:** Brasil tiene alta tasa de analfabetismo funcional y gente que prefiere audio.
**Solución:** Botón "Agendar por voz" en la landing → graba audio → AI Agent transcribe y agenda.
**Impacto:** Medio (inclusión digital, diferencial competitivo).
**Esfuerzo:** Medio (requiere Whisper API o similar).

### C4 — Painel: Comparación con Benchmarks
**Problema:** El profesional no sabe si su desempeño es bueno o malo.
**Solución:** Mostrar "Você está no top 30% dos profissionais de [categoría] em [cidade]" comparando métricas anónimas del sector.
**Impacto:** Alto (motivación, retención, upselling).
**Esfuerzo:** Medio (queries agregadas anónimas).

### C5 — Pagos: Pix Automático (Recorrente)
**Problema:** Planes mensuales requieren que el profesional pague manualmente cada mes.
**Solución:** Integrar Pix Automático do Banco Central (lanzado 2025/2026) para cobranza recurrente sin intervención.
**Impacto:** Alto (reduce churn por olvido de pago).
**Esfuerzo:** Alto (API nueva, requiere integración bancaria).

---

## Nuevos Ciclos Propuestos

### Ciclo 8: Retención y Fidelización

**Objetivo:** Que los clientes del profesional vuelvan automáticamente.

| Feature | Descripción | Esfuerzo |
|---------|-------------|----------|
| Reagendamento automático | Al concluir un servicio, enviar "¿Agendamos el próximo? Mismo día/hora en 30 días?" | Bajo |
| Programa de fidelidade | Cliente frecuente gana descuento progresivo (3ª visita -10%, 5ª -15%, 10ª -25%) | Medio |
| Segmentación de clientes | VIP (>5 visitas, ticket alto), Regulares (2-4), Inactivos (>90 días sin agendar) | Bajo |
| Campaña de rescate | Detectar inactivos → enviar WhatsApp personalizado con descuento ("Sentimos sua falta! Volte com 20% off") | Medio |
| Recordatorio post-servicio | 7 días después: "¿Cómo quedó el servicio? ¿Necesita ajuste?" — humaniza y previene reclamos públicos | Bajo |

**Métricas de éxito:** Tasa de re-agendamiento, LTV del cliente, churn rate.

---

### Ciclo 9: Marketing Automation

**Objetivo:** El profesional hace marketing sin saber de marketing.

| Feature | Descripción | Esfuerzo |
|---------|-------------|----------|
| Campañas estacionales | Templates pre-armados para datas importantes (Dia das Mães, Natal, Black Friday, Dia dos Namorados) con copys + imágenes | Medio |
| Email marketing integrado | Conectar conta Gmail do profissional → enviar newsletters automáticas a clientes (sin necesidad de Mailchimp) | Alto |
| Remarketing automático | Cliente visitó la landing pero no agendó → 24h después, WhatsApp recordatorio personalizado | Medio |
| Link tree inteligente | Página de links para Instagram bio con: agendar, WhatsApp, Google Maps, precios — todo en uno | Bajo |
| Stories/Reels templates | Generar videos/imágenes listas para postar en Instagram con el link de agendamento | Alto |

---

### Ciclo 10: Analytics Predictivo

**Objetivo:** La IA anticipa problemas y oportunidades antes que el profesional.

| Feature | Descripción | Esfuerzo |
|---------|-------------|----------|
| Predicción de faturamento | Basado en histórico, estimar cuánto facturará este mes y alertar si va por debajo | Medio |
| Alerta de abandono | "3 clientes que agendaban cada 15 días no volvieron hace 2 meses — ¿les escribo?" | Medio |
| Sugerencia de precios | "Tu ticket médio es R$ 80. En tu categoría el promedio es R$ 110. ¿Considerás ajustar?" | Bajo |
| Detección de horarios ociosos | "Los martes a las 10h tenés 70% de slots vacíos vs 95% ocupación los jueves" | Bajo |
| Previsión de demanda | "La próxima semana hay 40% más probabilidad de agendamentos que esta (estacionalidad)" | Alto |

---

### Ciclo 11: Multi-Staff / Equipo

**Objetivo:** Expandir de 1 profesional a equipos (salones, clínicas, barberías con varios empleados).

| Feature | Descripción | Esfuerzo |
|---------|-------------|----------|
| Múltiples profesionales | Cada staff member tiene su propia agenda, servicios y perfil dentro del mismo tenant | Alto |
| Asignación automática | Cliente agende "Corte" → sistema asigna al barbero disponible más cercano en horario | Alto |
| Comisiones | Tracking de cuánto facturó cada profesional, comisiones automáticas | Medio |
| Check-in/Kiosk mode | Tablet en recepción: cliente llega, toca "Cheguei" → notifica al profesional | Medio |

---

### Ciclo 12: Marketplace / Descubrimiento

**Objetivo:** Que clientes encuentren profesionales sin conocer su link directo.

| Feature | Descripción | Esfuerzo |
|---------|-------------|----------|
| Directorio público | `autonexabrasil.com.br/beleza/curitiba` → lista profesionales de belleza en Curitiba | Alto |
| SEO local | Páginas por categoría + ciudad indexadas en Google ("manicure curitiba", "personal trainer curitiba") | Alto |
| Selo de confiança | "Profissional verificado AN.BR" → badge en la landing, reviews verificadas | Bajo |
| Busca por proximidade | Geolocalización del cliente → profesionales más cercanos | Alto |

---

## Priorización y Roadmap

### Ahora (Sprint 1-2) — Quick Wins
1. **Upsell Inteligente (C2)** — inmediato, bajo esfuerzo, alto impacto en ticket médio
2. **Reagendamento automático (C8)** — bajo esfuerzo, reduce churn de clientes
3. **Alerta de abandono (C10)** — proactivo, preventivo, fideliza

### Próximo (Sprint 3-5) — Diferenciación
4. **Programa de fidelidade (C8)** — lealtad y recurrencia
5. **Campañas estacionales (C9)** — el profesional no hace marketing sin esto
6. **Link tree inteligente (C9)** — todo profesional con Instagram lo necesita

### Futuro (Sprint 6-10) — Escala
7. **Pix Automático (C5)** — retención de plan, reduce churn de pago
8. **Multi-Staff (C11)** — nuevo segmento de mercado (salones, clínicas)
9. **Marketplace (C12)** — canal de adquisición de clientes para profesionales

---

## Resumen por Esfuerzo e Impacto

| Iniciativa | Esfuerzo | Impacto | Ciclo |
|------------|----------|---------|-------|
| Upsell Inteligente | 🔵 Bajo | 🟢 Alto | C2 |
| Reagendamento automático | 🔵 Bajo | 🟢 Alto | C8 |
| Alerta de abandono | 🔵 Bajo | 🟢 Alto | C10 |
| Segmentación clientes | 🔵 Bajo | 🟡 Medio | C8 |
| Sugerencia de precios | 🔵 Bajo | 🟡 Medio | C10 |
| Link tree inteligente | 🔵 Bajo | 🟡 Medio | C9 |
| Selo de confiança | 🔵 Bajo | 🔵 Bajo | C12 |
| Recordatorio post-servicio | 🔵 Bajo | 🟡 Medio | C8 |
| Benchmark comparativo | 🟡 Medio | 🟢 Alto | C4 |
| Campaña de rescate | 🟡 Medio | 🟢 Alto | C8 |
| Campañas estacionales | 🟡 Medio | 🟡 Medio | C9 |
| Remarketing automático | 🟡 Medio | 🟡 Medio | C9 |
| Predicción faturamento | 🟡 Medio | 🟡 Medio | C10 |
| Booking por voz | 🟡 Medio | 🔵 Bajo | C3 |
| Programa de fidelidade | 🟡 Medio | 🟢 Alto | C8 |
| Pre-cadastro WhatsApp | 🟡 Medio | 🟢 Alto | C1 |
| Pix Automático | 🔴 Alto | 🟢 Alto | C5 |
| Multi-Staff | 🔴 Alto | 🟢 Alto | C11 |
| Marketplace / Directorio | 🔴 Alto | 🟢 Alto | C12 |
| Email marketing integrado | 🔴 Alto | 🟡 Medio | C9 |
| Stories/Reels templates | 🔴 Alto | 🟡 Medio | C9 |

---

**Conclusión 2026:** El mercado brasileño de profesionales autónomos está en plena digitalización. Quien ofrezca el "sistema operativo completo del negocio" (no solo agenda, sino marketing, fidelización, pagos y crecimiento) gana. Los próximos 3 movimientos estratégicos son: **fidelización automática, upsell inteligente y marketing sin fricción.**
