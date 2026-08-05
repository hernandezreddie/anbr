exports.handler = async () => {
  const base = process.env.NEXT_PUBLIC_DOMAIN || process.env.URL || "http://localhost:3000";
  const secret = process.env.CRON_SECRET || "";

  try {
    const res = await fetch(`${base}/api/planos/vencidos`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    console.log(`[cron-vencidos] ${res.status} ${await res.text()}`);
    return { statusCode: res.ok ? 200 : 500 };
  } catch (err) {
    console.error("[cron-vencidos]", err);
    return { statusCode: 500, body: String(err) };
  }
};
