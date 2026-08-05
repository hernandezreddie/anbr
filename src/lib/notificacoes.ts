import { createAdminClient } from "@/lib/supabase/admin";
import { sendText, getProvider } from "@/lib/whatsapp/evolution";
import { getMensagensPadrao } from "@/lib/servicos-padrao";
import { textoConviteAvaliacao } from "@/lib/avaliacoes";

function formatarData(data: string | null | undefined): string {
  if (!data) return "no dia combinado";
  const d = new Date(data + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatarHora(hora: string | null | undefined): string {
  if (!hora) return "";
  return hora.slice(0, 5);
}

export function preencherMensagem(
  texto: string,
  dados: { servico?: string | null; data?: string | null; hora?: string | null }
): string {
  return texto
    .replaceAll("{servico}", dados.servico || "o serviço")
    .replaceAll("{data}", formatarData(dados.data))
    .replaceAll("{hora}", formatarHora(dados.hora));
}

const fmtMoeda = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

async function podeEnviarAutomatico(profissional_id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from("agent_configs")
    .select("enabled")
    .eq("profissional_id", profissional_id)
    .single();
  return !(agent?.enabled);
}

type DestinoMensagem = {
  profissional_id: string;
  cliente_whatsapp?: string | null;
  servico_nome?: string | null;
  data?: string | null;
  hora?: string | null;
  valor?: number | null;
  endereco?: string | null;
};

async function enviarTemplate(
  destino: DestinoMensagem,
  tipo: "confirmacao" | "lembrete"
): Promise<{ enviado: boolean; motivo?: string }> {
  const whatsapp = destino.cliente_whatsapp?.replace(/\D/g, "");
  if (!whatsapp || whatsapp.length < 10) {
    return { enviado: false, motivo: "sem whatsapp do cliente" };
  }
  if (!(await podeEnviarAutomatico(destino.profissional_id))) {
    return { enviado: false, motivo: "agente ativo" };
  }

  const supabase = createAdminClient();
  const [prof, config] = await Promise.all([
    supabase
      .from("profissionais")
      .select("categoria")
      .eq("id", destino.profissional_id)
      .single(),
    supabase
      .from("configuracoes")
      .select("msg_variante")
      .eq("profissional_id", destino.profissional_id)
      .single(),
  ]);

  const mensagens = getMensagensPadrao(
    prof.data?.categoria,
    Number(config.data?.msg_variante) || 0
  );
  let texto = preencherMensagem(
    tipo === "confirmacao" ? mensagens.confirmacao : mensagens.lembrete,
    {
      servico: destino.servico_nome,
      data: destino.data,
      hora: destino.hora,
    }
  );

  if (tipo === "confirmacao") {
    const detalhes: string[] = [];
    if (destino.valor != null) detalhes.push(`💰 Valor: ${fmtMoeda(destino.valor)}`);
    if (destino.endereco) detalhes.push(`📍 ${destino.endereco}`);
    if (detalhes.length) texto += `\n\n${detalhes.join("\n")}`;
  }

  try {
    const provider = await getProvider(destino.profissional_id);

    // WhatsApp Cloud API: business-initiated exige template aprovado.
    // Tenta o template; se não estiver aprovado/configurado, cai no texto livre.
    if (provider === "meta_cloud") {
      try {
        const { getInstance, sendTemplate } = await import("@/lib/whatsapp/meta");
        const instance = await getInstance(destino.profissional_id);
        await sendTemplate(
          instance,
          whatsapp,
          tipo === "confirmacao" ? "confirmacao_agendamento" : "lembrete_agendamento",
          [destino.servico_nome || "o serviço", formatarData(destino.data), formatarHora(destino.hora)].filter(Boolean)
        );
        return { enviado: true };
      } catch (e) {
        console.warn(`[notificacoes] template não enviado, fallback texto livre: ${String(e)}`);
      }
    }

    await sendText(destino.profissional_id, whatsapp, texto);
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}

export async function enviarConfirmacao(
  destino: DestinoMensagem
): Promise<{ enviado: boolean; motivo?: string }> {
  return enviarTemplate(destino, "confirmacao");
}

export async function enviarNotificacaoProfissional(dados: {
  profissional_id: string;
  cliente_nome: string;
  servico_nome: string;
  adicionais: string[];
  data?: string | null;
  hora?: string | null;
  valor: number;
}): Promise<{ enviado: boolean; motivo?: string }> {
  const supabase = createAdminClient();
  const { data: prof } = await supabase
    .from("profissionais")
    .select("whatsapp")
    .eq("id", dados.profissional_id)
    .single();

  const destino = prof?.whatsapp?.replace(/\D/g, "");
  if (!destino || destino.length < 10) {
    return { enviado: false, motivo: "profissional sem whatsapp" };
  }

  const texto = [
    `📩 *Nova solicitação de agendamento!*`,
    ``,
    `👤 ${dados.cliente_nome}`,
    `🧼 ${dados.servico_nome}`,
    dados.adicionais.length ? `➕ Adicionais: ${dados.adicionais.join(", ")}` : "",
    dados.data ? `📅 ${formatarData(dados.data)}${dados.hora ? ` às ${formatarHora(dados.hora)}` : ""}` : "",
    `💰 Valor: ${fmtMoeda(dados.valor)}`,
    ``,
    `Acesse seu painel para confirmar: /painel/agendamentos`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { sendText } = await import("@/lib/whatsapp/evolution");
    await sendText(dados.profissional_id, destino, texto);
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}

const fmtDataLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function enviarLembretesPendentes(
  profissional_id: string,
  diasAhead: number[] = [1]
) {
  const supabase = createAdminClient();
  let enviados = 0;
  let falhas = 0;
  let total = 0;

  for (const dias of diasAhead) {
    const alvo = new Date();
    alvo.setDate(alvo.getDate() + dias);
    const dataAlvo = fmtDataLocal(alvo);
    const flagColuna = dias === 0 ? "msg_lembrete_mesmo_dia_enviado" : "msg_lembrete_enviado";

    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select("id, cliente_whatsapp, servico_nome, data, hora")
      .eq("profissional_id", profissional_id)
      .eq("data", dataAlvo)
      .in("status", ["solicitado", "confirmado"])
      .eq(flagColuna, false);

    total += agendamentos?.length || 0;
    for (const ag of agendamentos || []) {
      const res = await enviarTemplate(
        {
          profissional_id,
          cliente_whatsapp: ag.cliente_whatsapp,
          servico_nome: ag.servico_nome,
          data: ag.data,
          hora: ag.hora,
        },
        "lembrete"
      );
      if (res.enviado) {
        enviados++;
        await supabase.from("agendamentos").update({ [flagColuna]: true }).eq("id", ag.id);
      } else {
        falhas++;
      }
    }
  }
  return { enviados, falhas, total };
}

/**
 * Cron central: processa TODOS os profissionais com lembretes pendentes
 * (amanhã + mesmo dia) e encerra agendamentos confirmados com data passada (24h+).
 */
export async function processarLembretesGlobais() {
  const supabase = createAdminClient();

  const { data: profs } = await supabase
    .from("profissionais")
    .select("id, slug, whatsapp, status")
    .eq("status", "ativo");

  let enviados = 0;
  let falhas = 0;
  let total = 0;
  const porProfissional: { slug: string; enviados: number }[] = [];

  for (const prof of profs || []) {
    const { data: agent } = await supabase
      .from("agent_configs")
      .select("enabled")
      .eq("profissional_id", prof.id)
      .single();
    if (agent?.enabled) continue;

    const res = await enviarLembretesPendentes(prof.id, [1, 0]);
    enviados += res.enviados;
    falhas += res.falhas;
    total += res.total;
    porProfissional.push({ slug: prof.slug, enviados: res.enviados });

    if (res.enviados > 0) {
      try {
        const { enviarPushProfissional } = await import("@/lib/push-server");
        await enviarPushProfissional(
          prof.id,
          "🔔 Lembretes enviados",
          `${res.enviados} cliente(s) lembrado(s) para hoje/amanhã`,
          `/${prof.slug}/painel/agendamentos`
        );
      } catch {
        // best-effort
      }
    }
  }

  let concluidosAutomaticos = 0;
  let convites = 0;
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const { data: atrasados } = await supabase
    .from("agendamentos")
    .select("id, data")
    .eq("status", "confirmado")
    .lte("data", fmtDataLocal(ontem));

  for (const ag of atrasados || []) {
    await supabase.from("agendamentos").update({ status: "concluido" }).eq("id", ag.id);
    concluidosAutomaticos++;
    try {
      const res = await enviarConviteAvaliacao(ag.id);
      if (res.enviado) convites++;
    } catch {
      // best-effort
    }
  }

  return {
    enviados,
    falhas,
    total,
    porProfissional,
    concluidosAutomaticos,
    convitesEnviados: convites,
  };
}

/**
 * Envia o convite de avaliação após o serviço ser concluído.
 * O link aponta para o Google (se o profissional tiver link) ou para a página
 * interna de avaliação com o token do agendamento.
 */
export async function enviarConviteAvaliacao(
  agendamentoId: string
): Promise<{ enviado: boolean; motivo?: string }> {
  const supabase = createAdminClient();

  const { data: ag } = await supabase
    .from("agendamentos")
    .select("id, profissional_id, cliente_whatsapp, cliente_nome, token_avaliacao, convite_avaliacao_enviado")
    .eq("id", agendamentoId)
    .single();

  if (!ag) return { enviado: false, motivo: "agendamento não encontrado" };
  if (ag.convite_avaliacao_enviado) return { enviado: false, motivo: "convite já enviado" };

  const whatsapp = ag.cliente_whatsapp?.replace(/\D/g, "");
  if (!whatsapp || whatsapp.length < 10) {
    return { enviado: false, motivo: "sem whatsapp do cliente" };
  }
  if (!(await podeEnviarAutomatico(ag.profissional_id))) {
    return { enviado: false, motivo: "agente ativo" };
  }

  const [{ data: prof }, { data: config }] = await Promise.all([
    supabase.from("profissionais").select("slug, link_avaliacao").eq("id", ag.profissional_id).single(),
    supabase.from("configuracoes").select("google_maps").eq("profissional_id", ag.profissional_id).single(),
  ]);

  if (!prof?.slug) return { enviado: false, motivo: "sem slug" };

  const texto = textoConviteAvaliacao({
    nome: ag.cliente_nome || "",
    slug: prof.slug,
    link_avaliacao: prof.link_avaliacao,
    google_maps: config?.google_maps,
    token: ag.token_avaliacao,
  });

  try {
    const provider = await getProvider(ag.profissional_id);

    if (provider === "meta_cloud") {
      try {
        const { getInstance, sendTemplate } = await import("@/lib/whatsapp/meta");
        const instance = await getInstance(ag.profissional_id);
        await sendTemplate(instance, whatsapp, "convite_avaliacao", [
          ag.cliente_nome || "cliente",
          texto.includes("http") ? texto.match(/https?:\/\/\S+/)![0] : "nosso site",
        ]);
        await supabase
          .from("agendamentos")
          .update({ convite_avaliacao_enviado: true })
          .eq("id", ag.id);
        return { enviado: true };
      } catch (e) {
        console.warn(`[notificacoes] template convite não enviado, fallback texto livre: ${String(e)}`);
      }
    }

    await sendText(ag.profissional_id, whatsapp, texto);
    await supabase
      .from("agendamentos")
      .update({ convite_avaliacao_enviado: true })
      .eq("id", ag.id);
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}
