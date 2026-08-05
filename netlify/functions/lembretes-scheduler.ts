// Netlify Scheduled Function (respaldo del cron de Vercel).
// Dispara el endpoint interno de lembretes a las 12:00 UTC.
export const config = { schedule: "0 12 * * *" };

export default async function handler() {
  const url = process.env.NEXT_PUBLIC_DOMAIN || "https://autonexabrasil.com.br";
  const secret = process.env.CRON_SECRET || "";
  const res = await fetch(`${url}/api/agendamentos/lembretes`, {
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
  const body = await res.json();
  return Response.json({ status: res.status, body });
}
