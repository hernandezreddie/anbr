import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    redirect("/");
  }

  const adminDb = createAdminClient();

  const [profissionais, profiles, servicos, agendamentos] = await Promise.all([
    adminDb.from("profissionais").select("*").order("created_at", { ascending: false }),
    adminDb.from("profiles").select("profissional_id, role"),
    adminDb.from("servicos").select("profissional_id, id"),
    adminDb.from("agendamentos").select("profissional_id, status, valor"),
  ]);

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
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-lg font-semibold">AN.BR · Admin</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-ink-soft hover:text-ink">Sair</button>
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
                      t.role === "owner" ? "bg-emerald-100 text-emerald-700" :
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
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === "ativo" ? "bg-emerald-100 text-emerald-700" :
                      t.status === "suspenso" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`/${t.slug}/painel`}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      target="_blank"
                    >
                      Painel →
                    </a>
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