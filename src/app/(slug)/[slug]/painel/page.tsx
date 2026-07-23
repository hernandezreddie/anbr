import Guard from "@/components/painel/Guard";
import { createClient } from "@/lib/supabase/server";

async function PainelContent({ slug }: { slug: string }) {
  const supabase = await createClient();

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("*")
    .order("data", { ascending: true })
    .limit(50);

  if (!agendamentos) return null;

  const solicitados = agendamentos.filter((a: any) => a.status === "solicitado");
  const confirmados = agendamentos.filter((a: any) => a.status === "confirmado");
  const concluidos = agendamentos.filter((a: any) => a.status === "concluido");
  const faturamentoMes = concluidos
    .filter((a: any) => {
      const mes = new Date().getMonth();
      return new Date(a.data).getMonth() === mes;
    })
    .reduce((s: number, a: any) => s + a.valor, 0);

  return (
    <div className="container-x py-8">
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-sm text-ink-soft">Faturamento do mês</div>
          <div className="mt-1 text-2xl font-semibold">
            R$ {faturamentoMes.toFixed(2).replace(".", ",")}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-ink-soft">Agendamentos confirmados</div>
          <div className="mt-1 text-2xl font-semibold">{confirmados.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-ink-soft">Novas solicitações</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-600">
            {solicitados.length}
          </div>
        </div>
      </div>

      {solicitados.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Novas solicitações</h2>
          <div className="space-y-3">
            {solicitados.map((a: any) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.cliente_nome}</div>
                    <div className="text-sm text-ink-soft">
                      {new Date(a.data + "T" + a.hora).toLocaleDateString("pt-BR")} às {a.hora}
                    </div>
                  </div>
                  <span className="text-lg font-semibold">
                    R$ {a.valor.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function PainelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Guard slug={slug}>
      {(profissional) => <PainelContent slug={profissional.slug} />}
    </Guard>
  );
}
