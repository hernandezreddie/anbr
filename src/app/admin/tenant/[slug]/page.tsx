import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { isAdminPlataforma } from "@/lib/auth-roles";
import { PLANOS } from "@/lib/planos";
import { TenantDetailClient } from "./TenantDetailClient";
import { Badge } from "@/components/ui/Badge";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  if (!(await isAdminPlataforma())) redirect("/");

  const adminDb = createAdminClient();

  const profRes = await adminDb.from("profissionais").select("*").eq("slug", slug).maybeSingle();
  if (!profRes.data) redirect("/admin");
  const pid = profRes.data.id as string;

  const [config, servicos, agendamentos, clientes, pagamentos, usage, convs, agentCfg, domain] =
    await Promise.all([
      adminDb.from("configuracoes").select("*").eq("profissional_id", pid).maybeSingle(),
      adminDb.from("servicos").select("id, nome, ativo").eq("profissional_id", pid),
      adminDb.from("agendamentos").select("*").eq("profissional_id", pid).order("data", { ascending: false }).limit(15),
      adminDb.from("clientes").select("id", { count: "exact", head: true }).eq("profissional_id", pid),
      adminDb.from("pagamentos").select("valor, status").eq("profissional_id", pid),
      adminDb.from("agent_usage").select("*").eq("profissional_id", pid).order("date", { ascending: false }).limit(30),
      adminDb.from("agent_conversations").select("id", { count: "exact", head: true }).eq("profissional_id", pid),
      adminDb.from("agent_configs").select("*").eq("profissional_id", pid).maybeSingle(),
      adminDb.from("custom_domains").select("*").eq("profissional_id", pid).maybeSingle(),
    ]);

  const uso = (usage.data || []).reduce(
    (acc: any, row: any) => ({
      tokens_input: acc.tokens_input + (row.tokens_input || 0),
      tokens_output: acc.tokens_output + (row.tokens_output || 0),
      messages: acc.messages + (row.messages || 0),
      conversations: acc.conversations + (row.conversations || 0),
      cost: acc.cost + Number(row.cost || 0),
    }),
    { tokens_input: 0, tokens_output: 0, messages: 0, conversations: 0, cost: 0 }
  );

  const receita = (pagamentos.data || []).filter((p) => p.status === "pago").reduce((s, p) => s + Number(p.valor), 0);
  const planoId = (profRes.data.plano || "gratis") as keyof typeof PLANOS;
  const expira = profRes.data.plano_expira_em ? new Date(profRes.data.plano_expira_em) : null;
  const expirado = expira ? expira.getTime() <= Date.now() : false;
  const dias = expira ? Math.ceil((expira.getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="btn-ghost btn-sm">← Voltar</a>
            <span className="font-serif text-lg font-semibold">AN.BR · Admin</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="btn-ghost btn-sm">Sair</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{profRes.data.nome}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              /{profRes.data.slug} · {profRes.data.email} · {profRes.data.cidade || "sem cidade"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={profRes.data.status === "ativo" ? "success" : profRes.data.status === "suspenso" ? "error" : "default"}>
                {profRes.data.status === "ativo" ? "Ativo" : profRes.data.status === "suspenso" ? "Suspenso" : "Inativo"}
              </Badge>
              <Badge variant={planoId === "ia_premium" ? "primary" : planoId === "profissional" ? "success" : "default"}>
                {PLANOS[planoId]?.nome || planoId}
                {dias !== null && <span className={expirado ? "ml-1 text-red-500" : "ml-1"}>{expirado ? "· expirado" : `· ${dias}d`}</span>}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`/${profRes.data.slug}`} target="_blank" className="btn-primary btn-sm">Booking</a>
            <a href={`/${profRes.data.slug}/painel`} target="_blank" className="btn-outline btn-sm">Painel</a>
            <a href={`/admin/agent/${profRes.data.slug}`} className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-1">
              AI Agent
            </a>
            <a href={`/admin/domains/${profRes.data.slug}`} className="btn-ghost btn-sm">Domínio</a>
          </div>
        </div>

        <TenantDetailClient
          prof={profRes.data}
          config={config.data}
          dominio={domain.data}
          agenteAtivo={agentCfg.data?.enabled || false}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Serviços</p>
            <p className="mt-1 text-3xl font-bold">{(servicos.data || []).length}</p>
            <p className="mt-1 text-xs text-ink-soft">{(servicos.data || []).filter((s) => s.ativo).length} ativos</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Agendamentos</p>
            <p className="mt-1 text-3xl font-bold">{agendamentos.count ?? (agendamentos.data || []).length}</p>
            <p className="mt-1 text-xs text-ink-soft">últimos 15 listados</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Clientes</p>
            <p className="mt-1 text-3xl font-bold">{clientes.count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-ink-soft">Receita (pago)</p>
            <p className="mt-1 text-3xl font-bold">R$ {receita.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        {(convs.count || 0) > 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h3 className="text-sm font-semibold">AI Agent (30 dias)</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div><p className="text-xs text-ink-soft">Mensagens</p><p className="mt-0.5 text-lg font-bold">{uso.messages}</p></div>
              <div><p className="text-xs text-ink-soft">Conversas</p><p className="mt-0.5 text-lg font-bold">{uso.conversations}</p></div>
              <div><p className="text-xs text-ink-soft">Tokens in</p><p className="mt-0.5 text-lg font-bold">{uso.tokens_input.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-xs text-ink-soft">Tokens out</p><p className="mt-0.5 text-lg font-bold">{uso.tokens_output.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-xs text-ink-soft">Custo</p><p className="mt-0.5 text-lg font-bold">R$ {uso.cost.toFixed(4).replace(".", ",")}</p></div>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h3 className="text-sm font-semibold">Últimos agendamentos</h3>
          </div>
          {(agendamentos.data || []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-soft">Nenhum agendamento ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-gray-50 text-left text-sm font-medium text-ink-soft">
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Serviço</th>
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">Valor</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(agendamentos.data || []).map((a: any) => (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 text-sm font-medium">{a.cliente_nome}</td>
                      <td className="px-5 py-3 text-sm text-ink-soft">{a.servico_nome || "—"}</td>
                      <td className="px-5 py-3 text-sm">{a.data} {a.hora ? `· ${String(a.hora).slice(0, 5)}` : ""}</td>
                      <td className="px-5 py-3 text-sm">R$ {Number(a.valor).toFixed(2).replace(".", ",")}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          a.status === "concluido" ? "bg-emerald-100 text-emerald-700" :
                          a.status === "confirmado" ? "bg-teal-100 text-teal-700" :
                          a.status === "cancelado" ? "bg-red-100 text-red-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
