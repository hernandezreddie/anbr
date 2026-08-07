import { createAdminClient } from "@/lib/supabase/admin";
import { AdminClient } from "./AdminClient";
import { PlanosAdmin } from "./PlanosAdmin";
import { PLANOS } from "@/lib/planos";

export default async function AdminPage() {
  const adminDb = createAdminClient();

  const [profissionais, profiles, servicos, agendamentos, domains] = await Promise.all([
    adminDb.from("profissionais").select("*").order("created_at", { ascending: false }),
    adminDb.from("profiles").select("profissional_id, role"),
    adminDb.from("servicos").select("profissional_id, id"),
    adminDb.from("agendamentos").select("profissional_id, status, valor"),
    adminDb.from("custom_domains").select("profissional_id, domain, ssl_status, verified"),
  ]);

  const domainMap = new Map<string, { domain: string; ssl_status: string; verified: boolean }>();
  for (const d of (domains.data || []) as { profissional_id: string; domain: string; ssl_status: string; verified: boolean }[]) {
    domainMap.set(d.profissional_id, d);
  }

  const profMap = new Map<string, { role: string }>();
  for (const p of (profiles.data || []) as { profissional_id: string; role: string }[]) {
    profMap.set(p.profissional_id, { role: p.role });
  }

  const servCount = new Map<string, number>();
  for (const s of (servicos.data || []) as { profissional_id: string; id: string }[]) {
    servCount.set(s.profissional_id, (servCount.get(s.profissional_id) || 0) + 1);
  }

  const agStats = new Map<string, { total: number; receita: number; pendentes: number }>();
  for (const a of (agendamentos.data || []) as { profissional_id: string; status: string; valor: number }[]) {
    const cur = agStats.get(a.profissional_id) || { total: 0, receita: 0, pendentes: 0 };
    cur.total++;
    if (a.status === "concluido") cur.receita += a.valor;
    if (a.status === "solicitado") cur.pendentes++;
    agStats.set(a.profissional_id, cur);
  }

  const tenants = ((profissionais.data || []) as any[]).map((p) => ({
    ...p,
    role: profMap.get(p.id)?.role || "—",
    servicos: servCount.get(p.id) || 0,
    agendamentos: agStats.get(p.id) || { total: 0, receita: 0, pendentes: 0 },
    customDomain: domainMap.get(p.id),
  }));

  const agora = Date.now();
  const comPlanoPago = tenants.filter((t: any) => t.plano && t.plano !== "gratis");
  const expirando = comPlanoPago.filter((t: any) => {
    const exp = t.plano_expira_em ? new Date(t.plano_expira_em).getTime() : null;
    return exp && exp > agora && exp - agora <= 5 * 86400000;
  });
  const expirados = comPlanoPago.filter((t: any) => {
    const exp = t.plano_expira_em ? new Date(t.plano_expira_em).getTime() : null;
    return !exp || exp <= agora;
  });

  const diasRestantes = (expiraEm: string | null) => {
    if (!expiraEm) return null;
    return Math.ceil((new Date(expiraEm).getTime() - agora) / 86400000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <span className="text-sm font-bold">AN.BR · Admin</span>
          <form action="/auth/signout" method="post">
            <button className="btn-ghost btn-sm">Sair</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-xs text-neutral-500">{tenants.length} tenente(s)</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-[11px] text-neutral-500">Total de tenants</p>
            <p className="mt-0.5 text-xl font-bold">{tenants.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-[11px] text-neutral-500">Serviços ativos</p>
            <p className="mt-0.5 text-xl font-bold">
              {servicos.data?.length || 0}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-[11px] text-neutral-500">Agendamentos</p>
            <p className="mt-0.5 text-xl font-bold">
              {agendamentos.data?.length || 0}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-[11px] text-neutral-500">Receita total</p>
            <p className="mt-0.5 text-xl font-bold">
              R$ {(tenants.reduce((s, t) => s + t.agendamentos.receita, 0)).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <AdminClient />
        </div>

        <div className="mt-4">
          <PlanosAdmin />
        </div>

        {(expirados.length > 0 || expirando.length > 0) && (
          <div className="mt-4 space-y-2">
            {expirados.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-xs font-bold text-red-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  Planos expirados ({expirados.length})
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expirados.map((t: any) => (
                    <span key={t.id} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700">
                      {t.nome} <span className="text-red-400">·</span> /{t.slug}
                      <a href={`/admin/tenant/${t.slug}`} className="ml-1 font-semibold underline hover:text-red-900">gerir</a>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {expirando.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-xs font-bold text-amber-700">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  Renovações próximas ({expirando.length})
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expirando.map((t: any) => (
                    <span key={t.id} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-700">
                      {t.nome} <span className="text-amber-400">·</span> /{t.slug}
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-bold">
                        {diasRestantes(t.plano_expira_em)} dia(s)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-gray-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-3 py-2.5">Tenant</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Svc</th>
                <th className="px-3 py-2.5">Agend.</th>
                <th className="px-3 py-2.5">Receita</th>
                <th className="px-3 py-2.5">Plano</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: any) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0 hover:bg-gray-50/70">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <a href={`/admin/tenant/${t.slug}`} className="font-semibold text-neutral-900 hover:text-teal-700">
                        {t.nome}
                      </a>
                      <span className="font-mono text-[11px] text-neutral-400">/{t.slug}</span>
                    </div>
                    <p className="truncate text-xs text-neutral-400 max-w-[220px]">{t.email}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      t.role === "owner" ? "bg-teal-100 text-teal-700" :
                      t.role === "admin" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.role}</span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{t.servicos}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{t.agendamentos.total}</td>
                  <td className="px-3 py-2.5 font-medium">
                    R$ {t.agendamentos.receita.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const pid = (t.plano || "gratis") as keyof typeof PLANOS;
                      const dias = diasRestantes(t.plano_expira_em);
                      const expirado = dias !== null && dias <= 0;
                      return (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          pid === "ia_premium" ? "bg-purple-100 text-purple-700" :
                          pid === "profissional" ? "bg-teal-100 text-teal-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {PLANOS[pid]?.nome || pid}
                          {pid !== "gratis" && dias !== null && (
                            <span className={`ml-1 text-[10px] font-bold ${expirado ? "text-red-600" : dias <= 5 ? "text-amber-600" : "text-teal-700"}`}>
                              {expirado ? "· exp." : `· ${dias}d`}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      t.status === "ativo" ? "bg-teal-100 text-teal-700" :
                      t.status === "suspenso" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/admin/tenant/${t.slug}`}
                        className="rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-neutral-700 transition-colors"
                      >
                        Gerir
                      </a>
                      <a
                        href={`/${t.slug}`}
                        target="_blank"
                        className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        Booking
                      </a>
                      <a
                        href={`/${t.slug}/painel`}
                        target="_blank"
                        className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        Painel
                      </a>
                      <a
                        href={`/admin/agent/${t.slug}`}
                        className="rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        AI
                      </a>
                      <a
                        href={`/admin/domains/${t.slug}`}
                        className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        Domínio
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
