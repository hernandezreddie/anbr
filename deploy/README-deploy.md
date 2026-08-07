# Auto-deploy para servidor propio (Oracle Cloud / Hetzner / Cloudflare Tunnel)

Objetivo: hostear AN.BR sin depender de Netlify/Vercel (que bloquean o cancelan planes
gratuitos). Un VPS propio no tiene límites de builds, ni cláusulas comerciales, ni
timeouts de funciones.

## Opción A — Oracle Cloud "Always Free" (gratis para siempre, recomendada)

1. Crear cuenta en https://www.oracle.com/cloud/free/ (pedirán tarjeta SOLO para
   verificación, no cobran). Si te rechazan la cuenta, es aleatorio: probá de nuevo
   con otro email en unos días, o usá la Opción C.
2. Región: elegir "São Paulo" (sa-saopaulo-1) para baja latencia en Brasil.
   OJO: la región NO se puede cambiar después.
3. Compute → Instances → Create instance:
   - Shape: Ampere A1 (VM.Standard.A1.Flex) — ARM
   - OCPU: 4, Memoria: 24 GB (o lo que haya disponible; 2/12 mínimo ya alcanza)
   - Image: Ubuntu 24.04 LTS
   - SSH keys: subir tu clave pública (o generar y descargar la privada)
4. Red: asegurar Security List con Ingress para TCP 80 y 443 (HTTP/HTTPS).
5. SSH a la instancia y configurar:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   git clone https://github.com/hernandezreddie/livreta.git ~/app
   cd ~/app && cp .env.example .env   # o subir tu .env.local completo
   sudo docker compose -f deploy/docker-compose.yml up -d --build
   ```
6. DNS: apuntar autonexabrasil.com.br (A record) → IP pública de la instancia.
   Caddy emite HTTPS automático (Let's Encrypt). Los dominios custom de cada
   tenant → CNAME al dominio principal y agregarlos al Caddyfile.

### Mantener la instancia "activa" (evitar reclamación por inactividad)
Oracle reclama instancias idle de Always Free. Solución: un cron que toque la
instancia (o simplemente el tráfico normal del sitio ya la mantiene viva).

## Opción B — Cloudflare Tunnel (gratis, sin servidor, desde tu PC)

Útil como puente mientras tramitás Oracle o si no querés VPS:

1. `winget install cloudflare.cloudflared` (Windows)
2. `cloudflared tunnel login` → autorizar tu dominio
3. `cloudflared tunnel create anbr`
4. Crear config + DNS: `cloudflared tunnel route dns anbr autonexabrasil.com.br`
5. Ejecutar tu app local (`set PORT=4999 && npm run start`) y:
   `cloudflared tunnel run anbr`
6. Listo: HTTPS automático sin abrir puertos. (Requiere que tu PC esté encendida.)

## Opción C — Hetzner (US$4.90/mes, cero asteriscos)

1. Crear servidor CX22 (2 vCPU, 4 GB RAM, 40 GB NVMe, 20 TB tráfico).
2. Repetir los pasos 5-6 de la Opción A.

## Crons (lembretes 12:00, vencidos 03:00)

En el VPS, editar `crontab -e`:
```cron
0 12 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/agendamentos/lembretes >> /tmp/cron-lembretes.log 2>&1
0 3  * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/planos/vencidos >> /tmp/cron-vencidos.log 2>&1
```
($CRON_SECRET = la misma variable del .env)

## Deploy automático (git push)

El workflow `.github/workflows/deploy-vps.yml` ya está listo. Configurar en
GitHub → Settings → Secrets and variables → Actions:
- VPS_HOST: IP del servidor
- VPS_USER: usuario SSH (ubuntu / root)
- VPS_KEY: clave privada SSH

## Env vars necesarias en el .env del servidor

Copiar TODAS las variables de `.env.local` (Supabase URL + keys, META_*, GOOGLE_*,
OPENAI_*, OPENROUTER_*, WHATSAPP_*, CRON_SECRET, NEXT_PUBLIC_DOMAIN, etc.).

IMPORTANTE: en el VPS las NEXT_PUBLIC_* se leen en build time (cuando docker
compila), así que el .env debe existir ANTES del primer build.
