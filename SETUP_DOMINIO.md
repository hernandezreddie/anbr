# ============================================
# SETUP: autonexabrasil.com.br no Netlify
# ============================================
# Já configurado no código:
#   - .env.example  → NEXT_PUBLIC_DOMAIN
#   - netlify.toml   → build.environment
#   - next.config.ts → images.remotePatterns
#   - cadastro/sucesso → usa window.location.origin
#
# Passos manuais necessários:
# ============================================

# 1. NETLIFY — Adicionar domínio customizado
#    - Dashboard Netlify > Site > Site settings > Domain management
#    - "Add custom domain" → autonexabrasil.com.br
#    - Netlify vai gerar um DNS target tipo:
#      beamish-profiterole-c329ca.netlify.app

# 2. CLOUDFLARE — Apontar DNS para Netlify
#    No painel Cloudflare > DNS > Records, adicionar:
#
#    Tipo    Nome     Conteúdo                              Proxy
#    ─────   ─────    ─────────────────────────────         ─────
#    CNAME   @        beamish-profiterole-c329ca.netlify.app  DNS only (☁ desligado)
#    CNAME   www      beamish-profiterole-c329ca.netlify.app  DNS only
#    CNAME   *        beamish-profiterole-c329ca.netlify.app  DNS only (wildcard)
#
#    ⚠ Importante: Deixar Proxy como "DNS only" (laranja desligado)
#    para o Netlify gerenciar o SSL.

# 3. NETLIFY — SSL/TLS
#    - Após apontar o DNS, Netlify emite certificado Let's Encrypt automaticamente
#    - Em Domain management > HTTPS, ativar "Let's Encrypt"

# 4. SUPABASE — Authorized Redirects
#    No Dashboard Supabase > Authentication > Settings:
#    - Site URL: https://autonexabrasil.com.br
#    - Redirect URLs adicionar:
#      https://autonexabrasil.com.br/**
#      https://beamish-profiterole-c329ca.netlify.app/** (para teste)

# 5. VARIÁVEIS DE AMBIENTE no Netlify
#    Em Site settings > Environment variables, adicionar:
#    - NEXT_PUBLIC_DOMAIN = https://autonexabrasil.com.br
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - NEXT_PUBLIC_VAPID_PUBLIC_KEY
#    - VAPID_PRIVATE_KEY
#    - VAPID_CONTACT

# 6. REDEPLOY
#    Após DNS propagar, fazer novo deploy:
#    git push  ou  Netlify > Deploys > Trigger deploy

# ============================================
# TESTE
# ============================================
# Acessar: https://autonexabrasil.com.br/caridad-teste
# Admin:   https://autonexabrasil.com.br/admin