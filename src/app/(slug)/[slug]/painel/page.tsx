import { createClient } from "@/lib/supabase/server";

export default async function PainelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [agendamentos, servicos] = await Promise.all([
    supabase.from("agendamentos").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("servicos").select("*").order("ordem"),
  ]);

  const ags = agendamentos.data || [];
  const servs = servicos.data || [];

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const solicitados = ags.filter((a: any) => a.status === "solicitado");
  const confirmados = ags.filter((a: any) => a.status === "confirmado");
  const concluidos = ags.filter((a: any) => a.status === "concluido");

  const faturamentoMes = concluidos
    .filter((a: any) => new Date(a.data).getMonth() === mesAtual && new Date(a.data).getFullYear() === anoAtual)
    .reduce((s: number, a: any) => s + a.valor, 0);

  const faturamentoTotal = concluidos.reduce((s: number, a: any) => s + a.valor, 0);
  const servicosAtivos = servs.filter((s: any) => s.ativo).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-ink-soft">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Faturamento do mês</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            R$ {faturamentoMes.toFixed(2).replace(".", ",")}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Total agendamentos</span>
            <span className="text-2xl">📋</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{ags.length}</div>
          <div className="mt-1 text-xs text-ink-soft">
            {confirmados.length} confirmados · {concluidos.length} concluídos
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Serviços ativos</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{servicosAtivos}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Faturamento total</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            R$ {faturamentoTotal.toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Novas solicitações</h2>
          {solicitados.length === 0 ? (
            <div className="card p-8 text-center text-ink-soft">
              <div className="mb-2 text-3xl">✅</div>
              <p>Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitados.map((a: any) => (
                <div key={a.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.cliente_nome}</div>
                      <div className="text-sm text-ink-soft">
                        {new Date(a.data + "T" + a.hora).toLocaleDateString("pt-BR")} às {a.hora.slice(0, 5)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        R$ {a.valor.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Últimos agendamentos</h2>
          {ags.length === 0 ? (
            <div className="card p-8 text-center text-ink-soft">
              <div className="mb-2 text-3xl">📅</div>
              <p>Nenhum agendamento ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ags.slice(0, 10).map((a: any) => (
                <div key={a.id} className="card px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        a.status === "solicitado" ? "bg-amber-400" :
                        a.status === "confirmado" ? "bg-blue-400" :
                        a.status === "concluido" ? "bg-emerald-400" : "bg-gray-300"
                      }`} />
                      <span className="font-medium">{a.cliente_nome}</span>
                      <span className="text-ink-soft">
                        {new Date(a.data + "T" + a.hora).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <span className="font-medium">
                      R$ {a.valor.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
