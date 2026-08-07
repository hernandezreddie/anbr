# Task Plan: Mejoras de Conversión — AN.BR (Post-Auditoría QA)

## Goal
Implementar las mejoras P0/P1/P2 del diagnóstico de conversión (demo pública del painel, fixes de rutas, depoimentos reales, cadastro, chat AI funcional) validando cada una contra el código, documentando todo en los archivos de planificación y manteniendo build/typecheck limpios.

## Current Phase
Phase 1

## Phases

### Phase 1: Investigación & Validación
- [x] Validar diagnóstico QA contra el código (rutas, admin, painel, cadastro, avaliações)
- [x] Cargar skills (planning-with-files, cro)
- [x] Investigar mejores prácticas: demo dashboard SaaS, integración de depoimentos, chat AI widget (websearch)
- [x] Documentar hallazgos en findings.md
- **Status:** complete

### Phase 2: Quick Wins de Rutas (P0)
- [x] Redirect `/login` → `/entrar` (no más 404) — src/app/login/page.tsx
- [x] `/admin` sin sesión → pantalla de acceso restringido con CTA a `/entrar` (auth gate movido a admin/layout.tsx)
- [x] Verificar proxy.ts no interfiera (no toca rutas admin/login)
- **Status:** complete

### Phase 3: Demo Pública del Painel (P0 — barrera de conversión)
- [x] Diseñar ruta `/demo` con dashboard mock (métricas, agenda, QR Pix, AI Agent)
- [x] Tabs Painel / Site do cliente / AI Agent interactivos + tour guiado 3 pasos + modal Pix + chat AI con respuestas
- [x] Banner "demo" claro + CTA a `/cadastro` (header + CTA final)
- [x] Hero home: CTA secundario "Ver demo ao vivo" + link en sección pricing
- [x] Build verificado (ruta /demo incluida, 72 rutas)
- **Status:** complete

### Phase 4: Depoimentos Reales en Home (P1)
- [x] Integrar avaliacoes publicadas desde Supabase (client component con fetch + cancel flag)
- [x] Fallback honesto: sección oculta si no hay depoimentos aprobados (nunca fakes)
- [x] Colocación CRO: antes del pricing (decisión point) + media de estrellas
- **Status:** complete

### Phase 5: Chat AI Funcional en Home (P2)
- [x] Evaluar viabilidad: `/api/agent/chat` requiere auth + plan + tenant con API key → NO viable en home público sin infra
- [x] ChatDemo interactivo scripted en hero (chips + typing indicator + respuestas) — reemplaza mock estático
- [ ] (Futuro) Endpoint público con tenant demo whitelisted + env DEMO_TENANT_ID → pendiente infra
- **Status:** complete

### Phase 6: Mejora /cadastro (P1)
- [x] Diagnóstico: el form YA es multi-paso con indicador (el QA externo no lo vio — labels ocultas en móvil)
- [x] Barra de progreso animada + "Passo X de 5 · ~N min restantes"
- [x] Trust line junto al botón "Criar meu sistema" (grátis · sem cartão · cancele quando quiser)
- **Status:** complete

### Phase 7: Verificación & Entrega
- [x] Build completo (72 rutas, 0 errores) + typecheck + 24/24 tests
- [x] Actualizar AGENTS.md + documento vivo con todo
- [x] Entrega al usuario con resumen
- **Status:** complete

### Phase 8: Demo Personalizable + Dominio por Env (P1 #8 + P0-2)
- [x] Tab "Personalizar" en /demo: 6 colores + 2 templates + preview al vivo (recoloriza navbar/hero/CTA/servicios; template escuro = dark)
- [x] `src/lib/site.ts` (SITE_DOMAIN/SITE_URL por NEXT_PUBLIC_SITE_DOMAIN, fallback autonexabrasil.com.br)
- [x] Reemplazar 21 hardcodes de dominio (layout, sitemap, robots, blog×9, notificacoes, precos×2, cadastro, DomainClient, DemoClient, proxy)
- [x] Termos/privacidade → literales (texto legal); manifest → ya env-driven (sin tocar)
- [x] Verificación: tsc 0 errores, build 72 rutas, 24/24 tests
- **Status:** complete

### Phase 9: Documento maestro + Métricas de adopción (cierre del diagnóstico)
- [x] Crear `docs/DIAGNOSTICO_QA.md` — las 9 secciones del QA + estado de reparación por ítem + matices (analista sin info completa) + checklist vivo
- [x] Verificar P2#9 (Planos): ya existía en /precos y home → sin cambios
- [x] `GET /api/estatisticas` — count profissionais ativos + agendamentos concluídos (admin client, 503 on error)
- [x] `AdocaoStats.tsx` en home bajo la stats bar — prueba social real con umbrales honestos (≥10 profs / ≥100 agendamentos) y redondeo 10/100; se oculta si no hay datos
- [x] Verificación final: tsc 0 errores, build 72/72 (+/api/estatisticas), 24/24 tests
- **Status:** complete

### Phase 9.1: Autosave del cadastro (volver atrás sin perder datos)
- [x] Persistir todo el estado del form en sessionStorage (`anbr_rascunho`) en cada cambio
- [x] Restaurar al montar (atrás del navegador / recarga / "Voltar" del header no pierden el progreso)
- [x] Limpiar el rascunho al enviar con éxito
- [x] Verificación: tsc 0 errores, build 72/72, 24/24 tests
- **Status:** complete

### Phase 9.2: Fix "Novo agendamento" manual del painel (no guardaba)
- [x] Diagnóstico: INSERT sin profissional_id (bloqueado por RLS tenant, 42501) + crypto.randomUUID() roto en http/LAN (excepción sin catch → botón colgado en "Salvando…")
- [x] `src/lib/ids.ts`: getMeuProfissionalId (via profiles RLS self-select) + novoId (UUID con fallback)
- [x] Fix en agendamentos/page.tsx (salvar) y calendario/page.tsx (salvar, moverExcecao, cancelarExcecaoDia): profesional_id en todos los inserts + try/catch
- [x] Verificación: tsc 0 errores, build 72/72, 24/24 tests
- **Status:** complete

### Phase 9.3: Disponibilidad — días llenos visibles + horario de atención configurable
- [x] Alerta ámbar + select de horario bloqueado cuando el día está lleno (diaLimite o sin horarios libres) en ReservarClient
- [x] Migration `migrations_horarios.sql`: horario_inicio/horario_fim (INT, minutos, NULL = padrão 08:00–20:00) + agregado a schema_completo.sql
- [x] UI en /painel/perfil (sección "Limites"): selects apertura/cierre cada 30 min + "Padrão"; persistido por PATCH /api/config/atualizar
- [x] ReservarClient: slots generados dinámicamente dentro de la faixa (antes loop fijo 8–18) + indisponivel usa horarios reales
- [x] POST /api/agendamentos: jornada validada con horarios de config (fallback 8–20); WORK_INICIO/WORK_FIM eliminados del route
- [x] Verificación: tsc 0 errores, build 72/72, 24/24 tests
- **Status:** complete

### Phase 9.4: Servicios multi-día (24h+)
- [x] Ayuda a diagnosticar: un servicio 24h quedaba bloqueado por `inicio + duracao > wFim` (400) y en la UI ningún slot pasaba → "Sem horários livres" siempre
- [x] Semántica multi-día en POST: inicio obligatorio en `wIni` (400 claro), tope MAX_DURACAO_DIAS=31, conflicto validado en TODOS los días de la faixa con bloqueos de día completo
- [x] GET: rango [data−31, data] + bloques `{00:00, 1440}` por día afectado de agendamientos multi-día
- [x] ReservarClient: solo slot wIni disponible + aviso ámbar "Este serviço dura X dia(s) inteiro(s)"
- [x] Verificación: tsc 0 errores, build 72/72, 24/24 tests
- **Status:** complete

### Phase 9.5: Onboarding con embudo real + AI Ads coherentes con el plan
- [x] OnboardingWizard: estado real por paso (whatsapp via /api/whatsapp/instance; pagina via configuracoes; servicos count; google via calendar_email) + avanza al primer paso incompleto + verdes "Concluído"/"Continuar" + auto-ocultar si todo hecho + "Verificar novamente"
- [x] POST /api/ads/gerar: auth, datos server-side, IA real (key tenant/servidor, JSON mode, validarCopys) con fallback templates
- [x] Coherencia con plan: prompt con RecursosPlano (agente/dominio/límite 30/mes), templates con dicas por plan
- [x] AdsClient: banner plan (grátis → alerta + upgrade; pagado → "incluído"), badge origen IA/modelo, error visible
- [x] Verificación: tsc 0 errores, build 72/72, 24/24 tests
- **Status:** complete

### Phase 9.6: Temas por nicho + selector de plantilla en el painel
- [x] src/lib/temas.ts: TemaPreset + TEMAS_POR_NICHO (13 categorías) + getTemaPorNicho con fallback
- [x] Painel perfil: sección "Tema do seu nicho" (selector plantilla Clássico/Moderno + 13 temas en 1 toque + badge "Seu nicho") + template_id en tipo/carga/salvarTudo/Restaurar padrões
- [x] Cadastro: template_id auto por categoría + preview de tarjetas con color del nicho
- [x] API cadastro: seed del preset completo del nicho (colores/fondo/fuentes/template)
- [x] Revertida protección de borrado de agendamientos (decisión del usuario)
- [x] Verificación: tsc 0 errores, build 73/73, 24/24 tests
- **Status:** complete

### Phase 10 (PENDIENTE): Cierre
- [ ] Commit + push (preguntar al usuario)
- [ ] (Futuro) Endpoint público /api/demo/chat con env DEMO_TENANT_ID
- [ ] (Futuro) Video demo 30-60s (asset de marketing)
- [ ] (Futuro) Decidir marca/dominio final → fijar NEXT_PUBLIC_SITE_DOMAIN + SITE_DOMAIN en Netlify + DNS
- **Status:** pending

## Key Questions
1. ~~¿Hay un tenant demo en producción con config de agente para el chat AI?~~ → No garantizable: /api/agent/chat exige auth+plan+key. Chat público scripted + endpoint futuro con env DEMO_TENANT_ID
2. ~~¿La tabla avaliacoes tiene RLS pública de lectura?~~ → Sí: SELECT público solo con aprovada=true (migrations_avaliacoes.sql)
3. ~~¿La ruta /demo debe ser estática o conectada a tenant real?~~ → Estática con datos mock (sin auth, sin dep de BD)
4. ~~¿Video demo?~~ → Demo interactiva suficiente; video futuro opcional (best practice: lead with outcome)
5. ~~¿Qué hacer con el borrado de agendamientos cancelados?~~ → Borrado libre en cualquier estado (decisión usuario)
6. ~~¿Presets por nicho o 3ª plantilla?~~ → Presets por nicho + selector en painel (decisión usuario)
7. ~~¿Video de fondo por prestador?~~ → Sí, implementado (migration video_fundo + upload 15MB + Hero + painel/perfil); evidencia: background video ≈ percepción premium, no conversión directa
8. ~~¿Fondos animados estilo 21.dev?~~ → Sí: blobs/grid nuevos + mesh/aurora animados + fix @keyframes gradientShift + prefers-reduced-motion
9. ~~¿Botones en superadmin?~~ → Sí: PATCH /api/admin/tenant/config + sección "Landing do prestador" en TenantDetail
10. ~~¿CRM tipo embudo?~~ → YA EXISTE: /painel/clientes con etapas de embudo (lib/etapas-cliente.ts); SidebarClient desktop viejo es código muerto
11. ~~¿Mejorar estilos de landings?~~ → Auditoría hecha: MobileCtaBar (sticky mobile), duración visible en Servicos, smooth scroll + scroll-margin, WhatsAppFloat coordinado
12. ~~¿Para qué sirve "confirmar" si el cliente agendó por la web?~~ → Análisis con código real: el sistema YA envía confirmación al reservar (mensaje dice "está confirmado") y el botón Confirmar solo cambiaba estado sin enviar nada. DECISIÓN usuario: Opción A — auto-confirmar (web nace "confirmado"); profesional solo cancela/concluye. Bonus: cancelar ahora avisa al cliente por WhatsApp (cerrado hueco real)
13. ~~¿Video en mobile?~~ → Desactivado en <768px y reduced-motion; color automático derivado del primary (gradiente)
14. ~~¿Título "Não encontrado | AN.BR" en painel?~~ → Fue transitorio (404 momentáneo por lookup fallido); ya blindado: generateMetadata propio del painel (nunca hereda título de 404 si renderiza)

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Planificación en archivos (task_plan.md, findings.md, progress.md) | Skill planning-with-files — memoria persistente en disco |
| Demo painel como ruta /demo con datos mock | No requiere auth ni seed en BD; muestra el producto real |
| Criterio CRO aplicado a home (cro skill) | Las mejoras se priorizan por impacto en conversión |
| Depoimentos reales con fallback honesto (sección oculta si vacío) | Prueba social real; testimonios falsos dañan la confianza (research) |
| Chat público scripted (sin backend) en home | /api/agent/chat requiere auth+plan+API key; scripted no tiene dependencias |
| /login → redirect a /entrar; gate admin en layout con pantalla restringida | Sin 404s; UX clara sin exponer datos |
| Temas por nicho: presets curados por categoría, aplicables en 1 toque, sin bloquear ajuste manual | El tema predefinido teal no servía a todos los nichos; el usuario pidió que la plantilla se adapte al negocio |
| Borrado de agendamientos SIN restricción de estado | El usuario confirmó que está bien eliminar incluso cancelados ("no me lo bloquees") |
| Presets por nicho + selector en painel (vs 3ª plantilla "Escuro") | Usuario eligió presets; /demo aún ofrece "Escuro" que no existe en producción (deuda conocida) |
| Video de fondo implementado con reglas duras (loop corto, muted, poster, overlays, 15MB) | Background video no mueve conversión por sí solo (evidencia); solo percepción premium. Video explicativo > background (futuro) |
| Todo "paso a paso": fondos → video → superadmin → Kanban → clientes (ya existía) → auditoría | Usuario pidió implementar todo secuencialmente |
| Mejoras landing top-3: barra CTA sticky mobile, duración en servicios, smooth scroll | Componentes compartidos ya eran sólidos (CtaFinal, Nav, WhatsAppFloat) |
| Auto-confirmar agendamientos web (Opción A) | El cliente ya recibía "confirmado" por WhatsApp al reservar; el botón Confirmar no enviaba nada. Menos fricción, sin doble confirmación. "solicitado" queda solo para filas legacy |
| Cancelar SIEMPRE avisa al cliente por WhatsApp | Hueco real detectado en el análisis de estados (CEO no le vio función a "confirmar") — el aviso de cancelación es la contracara de la confianza |
| Video de fondo desactivado en mobile + color automático del primary | Datos + rendimiento; el gradiente del primary mantiene la marca sin cargar video |
| Stepper compacto + autofill + barra sticky de resumen en reservar (mobile) | Pedido explícito del usuario (mejoras mobile) |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Re-read this plan before major decisions
- Log ALL errors — they help avoid repetition
- Documento vivo del usuario = task_plan.md + findings.md + progress.md + AGENTS.md (al final)

## Task Plan — Migración Cloudflare (sesión 2026-08-07, sigue en otro chat)
- [x] Investigar hosting gratis 2026 (Netlify/Vercel/Cloudflare/Oracle/Hetzner)
- [x] Instalar @opennextjs/cloudflare + wrangler
- [x] open-next.config.ts + wrangler.toml
- [x] Fix middleware edge (fetch REST en vez de @supabase/ssr)
- [x] Renombrar proxy.ts → middleware.ts (Next 16 Node-only proxy)
- [x] Build worker OK
- [x] Probar API routes en wrangler dev
- [x] Documentar MIGRACION_CLOUDFLARE.md + AGENTS.md + progress/findings
- [ ] wrangler login (usuario crea cuenta dash.cloudflare.com)
- [ ] wrangler deploy
- [ ] Env vars en Cloudflare (todas las de .env.local)
- [ ] Verificar páginas en prod (/, /dogdaycare-br, /reservar, /painel)
- [ ] Crons: Cron Triggers en wrangler.toml (0 12 * * * lembretes, 0 3 * * * vencidos)
- [ ] Dominio autonexabrasil.com.br → Cloudflare
- [ ] Mantener Netlify vivo como fallback

