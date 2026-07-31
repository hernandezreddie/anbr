import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";
import { PlanosAdmin } from "./PlanosAdmin";
import { PLANOS } from "@/lib/planos";
import { isAdminPlataforma } from "@/lib/auth-roles";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  if (!(await isAdminPlataforma())) {
    redirect("/");
  }

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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-lg font-semibold">AN.BR · Admin</span>
          <form action="/auth/signout" method="post">
            <button className="btn-ghost btn-sm">Sair</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
        <p className="mt-1 text-sm text-ink-soft">{tenants.length} tenente(s)</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Total de tenants</p>
            <p className="mt-1 text-3xl font-bold">{tenants.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Serviços ativos</p>
            <p className="mt-1 text-3xl font-bold">
              {servicos.data?.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Agendamentos</p>
            <p className="mt-1 text-3xl font-bold">
              {agendamentos.data?.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Receita total</p>
            <p className="mt-1 text-3xl font-bold">
              R$ {(tenants.reduce((s, t) => s + t.agendamentos.receita, 0)).toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AdminClient />
        </div>

        <div className="mt-6">
          <PlanosAdmin />
        </div>

        {(expirados.length > 0 || expirando.length > 0) && (
          <div className="mt-6 space-y-3">
            {expirados.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-red-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  Planos expirados ({expirados.length})
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expirados.map((t: any) => (
                    <span key={t.id} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700">
                      {t.nome} <span className="text-red-400">·</span> /{t.slug}
                      <a href={`/admin/domains/${t.slug}`} className="ml-1 font-semibold underline hover:text-red-900">ver</a>
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-red-500">
                  Os recursos pagos (Google Calendar, DM, AI Agent, domínio) já estão bloqueados para estes tenants.
                </p>
              </div>
            )}
            {expirando.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  Renovações próximas ({expirando.length})
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expirando.map((t: any) => (
                    <span key={t.id} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700">
                      {t.nome} <span className="text-amber-400">·</span> /{t.slug}
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold">
                        {diasRestantes(t.plano_expira_em)} dia(s)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-gray-50 text-left text-sm font-medium text-ink-soft">
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Nome</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Serviços</th>
                <th className="px-5 py-4">Agend.</th>
                <th className="px-5 py-4">Receita</th>
                <th className="px-5 py-4">Plano</th>
                <th className="px-5 py-4">Domínio</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: any) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-mono text-sm">{t.slug}</td>
                  <td className="px-5 py-4 font-medium">{t.nome}</td>
                  <td className="px-5 py-4 text-sm text-ink-soft">{t.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.role === "owner" ? "bg-teal-100 text-teal-700" :
                      t.role === "admin" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm">{t.servicos}</td>
                  <td className="px-5 py-4 text-sm">{t.agendamentos.total}</td>
                  <td className="px-5 py-4 text-sm font-medium">
                    R$ {t.agendamentos.receita.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const pid = (t.plano || "gratis") as keyof typeof PLANOS;
                      const dias = diasRestantes(t.plano_expira_em);
                      const expirado = dias !== null && dias <= 0;
                      return (
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pid === "ia_premium" ? "bg-purple-100 text-purple-700" :
                          pid === "profissional" ? "bg-teal-100 text-teal-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {PLANOS[pid]?.nome || pid}
                          {pid !== "gratis" && dias !== null && (
                            <span className={`ml-1 text-[10px] font-bold ${expirado ? "text-red-600" : dias <= 5 ? "text-amber-600" : "text-teal-700"}`}>
                              {expirado ? "· expirado" : `· ${dias}d`}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {t.customDomain ? (
                      <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${
                        t.customDomain.verified ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {t.customDomain.domain}
                        {t.customDomain.verified ? " ✓" : " (pendente)"}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "ativo" ? "bg-teal-100 text-teal-700" :
                      t.status === "suspenso" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <a
                        href={`/${t.slug}`}
                        target="_blank"
                        className="btn-primary btn-sm"
                      >
                        Booking
                      </a>
                      <a
                        href={`/${t.slug}/painel`}
                        target="_blank"
                        className="btn-outline btn-sm"
                      >
                        Painel
                      </a>
                      <a
                        href={`/admin/agent/${t.slug}`}
                        className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-1"
                      >
                        AI Agent
                      </a>
                      <a
                        href={`/admin/domains/${t.slug}`}
                        className="btn-ghost btn-sm"
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
