# LIVRETA — Sistema Multi-Tenant de Agendamento para Profissionais

## O que é
Plataforma SaaS onde profissionais de serviço (limpeza, personal trainer, etc.)
criam seu próprio sistema de agendamento completo em 5 minutos.
Modelo Shopify: cada profissional tem seu subdomínio, sua landing, seu painel.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + RLS)
- Vercel (hosting, wildcard subdomínios)
- Asaas/Stripe (cobrança)

## Projeto base
O código-fonte do Caridad Limpeza (D:\CCP) serviu como template base.
NÃO modificar D:\CCP — está em produção.

## Comandos
```bash
npm run dev      # local dev
npm run build    # production build
npm start        # serve production build
```

## Arquitetura
- proxy.ts → lê subdomínio do Host header, reescreve para /_slug/[slug]/
- layout raiz → fontes Inter + Fraunces
- slug layout → carrega config do profissional, aplica template visual
- RLS por profissional_id em TODAS as tabelas
- Service role key usada APENAS server-side (páginas públicas)
- Authenticated users usam cliente server-side com sessão

## Convenções
- Código em produção: português
- Comunicação comigo: espanhol (usuário)
- Nome do projeto: LIVRETA
- Pasta: D:\SistemaProfissional
- Template Caridad: D:\CCP (não modificar)
