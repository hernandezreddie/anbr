import { createAdminClient } from "@/lib/supabase/admin";
import { sendText } from "@/lib/whatsapp/evolution";
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
  const texto = preencherMensagem(
    tipo === "confirmacao" ? mensagens.confirmacao : mensagens.lembrete,
    {
      servico: destino.servico_nome,
      data: destino.data,
      hora: destino.hora,
    }
  );

  try {
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

export async function enviarLembretesPendentes(profissional_id: string) {  const supabase = createAdminClient();
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataAlvo = amanha.toISOString().slice(0, 10);

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("id, cliente_whatsapp, servico_nome, data, hora")
    .eq("profissional_id", profissional_id)
    .eq("data", dataAlvo)
    .in("status", ["solicitado", "confirmado"])
    .eq("msg_lembrete_enviado", false);

  let enviados = 0;
  let falhas = 0;
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
      await supabase
        .from("agendamentos")
        .update({ msg_lembrete_enviado: true })
        .eq("id", ag.id);
    } else {
      falhas++;
    }
  }
  return { enviados, falhas, total: agendamentos?.length || 0 };
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
