// Cloudflare for SaaS — Custom Hostname management

const CF_API = "https://api.cloudflare.com/client/v4"

function getHeaders() {
  return {
    "Authorization": `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
  }
}

export async function createCustomHostname(
  domain: string
): Promise<{
  hostname_id: string
  ssl_status: string
  validation_records: { type: string; name: string; value: string }[]
}> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!

  const res = await fetch(`${CF_API}/zones/${zoneId}/custom_hostnames`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      hostname: domain,
      ssl: {
        method: "txt",
        type: "dv",
        wildcard: false,
      },
    }),
  })

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "Erro ao criar custom hostname")
  }

  const result = data.result
  const sslRecord = result.ssl?.validation_records?.[0] || result.ssl?.validation_errors?.[0]

  return {
    hostname_id: result.id,
    ssl_status: result.ssl?.status || "pending",
    validation_records: [
      {
        type: sslRecord?.txt_name ? "TXT" : "CNAME",
        name: sslRecord?.txt_name || domain,
        value: sslRecord?.txt_value || result.hostname,
      },
    ],
  }
}

export async function verifyHostname(hostnameId: string): Promise<{ ssl_status: string; verified: boolean }> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!

  const res = await fetch(`${CF_API}/zones/${zoneId}/custom_hostnames/${hostnameId}`, {
    headers: getHeaders(),
  })

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "Erro ao verificar hostname")
  }

  const result = data.result
  return {
    ssl_status: result.ssl?.status || "pending",
    verified: result.ssl?.status === "active",
  }
}

export async function deleteCustomHostname(hostnameId: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID!

  const res = await fetch(`${CF_API}/zones/${zoneId}/custom_hostnames/${hostnameId}`, {
    method: "DELETE",
    headers: getHeaders(),
  })

  const data = await res.json()
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "Erro ao deletar hostname")
  }
}
