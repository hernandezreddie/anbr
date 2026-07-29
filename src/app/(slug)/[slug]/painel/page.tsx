import { createClient } from "@/lib/supabase/server";
import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { 
  DollarSign, 
  Calendar, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  Users,
  CreditCard
} from "lucide-react";

export default async function PainelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const config = await getProfissionalFullConfig(slug);
  if (!config) return null;

  const primary = config.configuracao.cor_primaria;
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

  const StatusIcon = ({ status }: { status: string }) => {
    const colors = {
      solicitado: "bg-amber-400",
      confirmado: "bg-blue-400",
      concluido: "bg-emerald-400",
    };
    return <span className={`h-2 w-2 rounded-full ${colors[status as keyof typeof colors] || "bg-gray-300"}`} />;
  };

  const iconStyle = { width: 24, height: 24, color: primary };
  const cardIconStyle = { width: 32, height: 32, color: primary };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: `var(--color-ink)` }}>Dashboard</h1>
        <p className="mt-1" style={{ color: `var(--color-ink-soft)` }}>Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: `var(--color-ink-soft)` }}>Faturamento do mês</span>
            <DollarSign style={cardIconStyle} />
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: `var(--color-ink)` }}>
            R$ {faturamentoMes.toFixed(2).replace(".", ",")}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: `var(--color-ink-soft)` }}>Total agendamentos</span>
            <Calendar style={cardIconStyle} />
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: `var(--color-ink)` }}>{ags.length}</div>
          <div className="mt-1 text-xs" style={{ color: `var(--color-ink-soft)` }}>
            {confirmados.length} confirmados · {concluidos.length} concluídos
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: `var(--color-ink-soft)` }}>Serviços ativos</span>
            <Zap style={cardIconStyle} />
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: `var(--color-ink)` }}>{servicosAtivos}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: `var(--color-ink-soft)` }}>Faturamento total</span>
            <TrendingUp style={cardIconStyle} />
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: `var(--color-ink)` }}>
            R$ {faturamentoTotal.toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: `var(--color-ink)` }}>Novas solicitações</h2>
          {solicitados.length === 0 ? (
            <div className="card p-8 text-center" style={{ color: `var(--color-ink-soft)` }}>
              <CheckCircle className="mx-auto mb-2" style={cardIconStyle} />
              <p>Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitados.map((a: any) => (
                <div key={a.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium" style={{ color: `var(--color-ink)` }}>{a.cliente_nome}</div>
                      <div className="text-sm" style={{ color: `var(--color-ink-soft)` }}>
                        {new Date(a.data + "T" + a.hora).toLocaleDateString("pt-BR")} às {a.hora.slice(0, 5)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold" style={{ color: `var(--color-ink)` }}>
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
          <h2 className="mb-4 text-lg font-semibold" style={{ color: `var(--color-ink)` }}>Últimos agendamentos</h2>
          {ags.length === 0 ? (
            <div className="card p-8 text-center" style={{ color: `var(--color-ink-soft)` }}>
              <Calendar className="mx-auto mb-2" style={cardIconStyle} />
              <p>Nenhum agendamento ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ags.slice(0, 10).map((a: any) => (
                <div key={a.id} className="card px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={a.status} />
                      <span className="font-medium" style={{ color: `var(--color-ink)` }}>{a.cliente_nome}</span>
                      <span style={{ color: `var(--color-ink-soft)` }}>
                        {new Date(a.data + "T" + a.hora).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <span className="font-medium" style={{ color: `var(--color-ink)` }}>
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
