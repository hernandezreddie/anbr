import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getPlanoAtivo, AGENDAMENTOS_GRATIS_POR_MES } from "@/lib/planos";
import { estimar } from "@/lib/precos";
import { rateLimitar, ipDoRequest } from "@/lib/rate-limit";
import type { Servico, Adicional, Frequencia, Promocao } from "@/types";

const VALID_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_WHATSAPP = /^\d{10,13}$/;
const round05 = (n: number) => Math.round(n * 2) / 2;

const sanitizeTexto = (txt: string | undefined | null): string => {
  if (!txt) return "";
  return txt
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .slice(0, 500);
};

const horaParaMin = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};

function duracaoMinutos(servico: Servico, horas: number): number {
  if (servico.tipo_preco === "fixo") {
    return servico.duracao_minutos || 60;
  }
  return Math.max(30, Math.round((horas || 1) * 60));
}

const MAX_DURACAO_DIAS = 31;

const somarDiasISO = (dataISO: string, dias: number) => {
  const d = new Date(dataISO + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const formatarMinuto = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const ehMultiDia = (duracao: number, wIni: number, wFim: number) => duracao > wFim - wIni;

// Días (incluyendo el de inicio) que ocupa un servicio que empieza a inicioMin del día dataInicio
const diasDaFaixa = (dataInicio: string, inicioMin: number, duracao: number) => {
  const nDias = Math.max(1, Math.ceil((inicioMin + duracao) / 1440));
  return Array.from({ length: nDias }, (_, i) =>
    i === 0 ? dataInicio : somarDiasISO(dataInicio, i)
  );
};

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    const data = request.nextUrl.searchParams.get("data");

    if (!slug || !data) {
      return NextResponse.json({ error: "slug e data são obrigatórios" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: prof } = await supabase
      .from("profissionais")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!prof) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    const [ags, servicos, config] = await Promise.all([
      supabase
        .from("agendamentos")
        .select("data, hora, servico_id, horas")
        .eq("profissional_id", prof.id)
        .gte("data", somarDiasISO(data, -MAX_DURACAO_DIAS))
        .lte("data", data)
        .neq("status", "cancelado"),
      supabase.from("servicos").select("id, tipo_preco, duracao_minutos"),
      supabase
        .from("configuracoes")
        .select("max_agendamentos_dia, horario_inicio, horario_fim")
        .eq("profissional_id", prof.id)
        .single(),
    ]);

    const durPorServico = new Map<string, number>();
    for (const s of servicos.data || []) {
      if (s.tipo_preco === "fixo" && s.duracao_minutos) {
        durPorServico.set(s.id, s.duracao_minutos);
      }
    }

    const wIni = Number(config.data?.horario_inicio) || 8 * 60;
    const wFim = Number(config.data?.horario_fim) || 20 * 60;

    // Servicios multi-día bloquean el día completo en cada día que ocupan
    const ocupados: { inicio: string; minutos: number }[] = [];
    for (const a of ags.data || []) {
      if (!a.hora) continue;
      const minutos =
        durPorServico.get(a.servico_id) ||
        Math.max(30, Math.round((Number(a.horas) || 1) * 60));
      if (ehMultiDia(minutos, wIni, wFim)) {
        if (diasDaFaixa(a.data, horaParaMin(a.hora), minutos).includes(data)) {
          ocupados.push({ inicio: "00:00", minutos: 1440 });
        }
      } else if (a.data === data) {
        ocupados.push({ inicio: a.hora.slice(0, 5), minutos });
      }
    }

    return NextResponse.json({
      ocupados,
      max_agendamentos_dia: Number(config.data?.max_agendamentos_dia) || 0,
      horario_inicio: Number(config.data?.horario_inicio) || null,
      horario_fim: Number(config.data?.horario_fim) || null,
      total_dia: (ags.data || []).filter((a) => a.data === data).length,
    });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimitar(`agendamentos:${ipDoRequest(request)}`, 5, 60_000);
    if (!limit.permitido) {
      return NextResponse.json(
        { error: `Muitas tentativas. Aguarde ${limit.emBreve}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      slug,
      servico_id,
      adicionais,
      adicionais_ids,
      quartos = 0,
      banheiros = 0,
      frequencia,
      data,
      hora,
      cliente_nome,
      cliente_whatsapp,
      cliente_endereco,
      consentimento,
    } = body;

    if (!consentimento) {
      return NextResponse.json(
        { error: "É necessário aceitar os Termos de Uso e a Política de Privacidade (LGPD) para agendar." },
        { status: 400 }
      );
    }

    // ---- Validações básicas ----
    if (!slug || !servico_id || !cliente_nome?.trim() || !data || !hora) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const whatsapp = String(cliente_whatsapp || "").replace(/\D/g, "");
    if (!VALID_WHATSAPP.test(whatsapp)) {
      return NextResponse.json(
        { error: "WhatsApp inválido. Informe o número com DDD (ex: 41999999999)." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAlvo = new Date(data + "T12:00:00");
    if (isNaN(dataAlvo.getTime()) || dataAlvo < hoje) {
      return NextResponse.json({ error: "Escolha uma data futura." }, { status: 400 });
    }

    if (!VALID_HORA.test(hora)) {
      return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // ---- Profissional ----
    const { data: prof } = await adminDb
      .from("profissionais")
      .select("id, status")
      .eq("slug", slug)
      .single();

    if (!prof) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }
    if (prof.status !== "ativo") {
      return NextResponse.json({ error: "Profissional indisponível no momento." }, { status: 403 });
    }

    // ---- Serviço (sempre da BD, nunca do cliente) ----
    const { data: servico } = await adminDb
      .from("servicos")
      .select("*")
      .eq("id", servico_id)
      .eq("profissional_id", prof.id)
      .eq("ativo", true)
      .single();

    if (!servico) {
      return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
    }

    // ---- Adicionais (validar existência) ----
    const idsAdicionais: string[] = Array.isArray(adicionais_ids)
      ? adicionais_ids.filter((x): x is string => typeof x === "string")
      : [];
    let adicionaisDb: Adicional[] = [];
    if (idsAdicionais.length > 0) {
      const { data: adc } = await adminDb
        .from("adicionais")
        .select("*")
        .eq("profissional_id", prof.id)
        .eq("ativo", true)
        .in("id", idsAdicionais);
      adicionaisDb = (adc || []) as Adicional[];
      if (adicionaisDb.length !== idsAdicionais.length) {
        return NextResponse.json({ error: "Adicional inválido." }, { status: 400 });
      }
    }

    // ---- Frequência (desconto sempre da BD) ----
    const freqSlug = typeof frequencia?.slug === "string" ? frequencia.slug : null;
    let frequenciaDb: Frequencia | null = null;
    if (freqSlug) {
      const { data: fq } = await adminDb
        .from("frequencias")
        .select("*")
        .eq("profissional_id", prof.id)
        .eq("slug", freqSlug)
        .single();
      if (!fq) {
        return NextResponse.json({ error: "Frequência inválida." }, { status: 400 });
      }
      frequenciaDb = fq as Frequencia;
    }

    // ---- Promoção ativa aplicável ----
    const { data: promos } = await adminDb
      .from("promocoes")
      .select("*")
      .eq("profissional_id", prof.id)
      .eq("ativo", true);

    const promoAtiva = ((promos || []) as Promocao[]).find(
      (p) =>
        (!p.servico_id || p.servico_id === servico_id) &&
        (!p.dias_semana?.length ||
          p.dias_semana.includes(String(new Date(data + "T12:00:00").getDay())))
    );

    // ---- Recalcular horas e valor server-side (nunca confiar no cliente) ----
    const usaComodos = (await adminDb.from("profissionais").select("categoria").eq("id", prof.id).single()).data?.categoria === "limpeza";
    const horasBase = servico.tipo_preco !== "fixo"
      ? round05(servico.horas_base + (usaComodos ? Number(quartos) * 0.75 + Number(banheiros) * 0.75 : 0))
      : 0;

    const orcamento = estimar({
      servico: servico as Servico,
      horas_base: horasBase,
      adicionais: adicionaisDb,
      adicionaisSelecionados: idsAdicionais,
      frequencia: frequenciaDb,
      promocao: promoAtiva ? { tipo: promoAtiva.tipo, valor: promoAtiva.valor } : null,
    });

    const horas = servico.tipo_preco === "fixo" ? 0 : orcamento.horas;
    const valor = orcamento.total;

    // ---- Jornada de trabalho (horários do profissional, fallback 08:00–20:00) ----
    const { data: cfgJornada } = await adminDb
      .from("configuracoes")
      .select("horario_inicio, horario_fim")
      .eq("profissional_id", prof.id)
      .single();

    const wIni = Number(cfgJornada?.horario_inicio) || 8 * 60;
    const wFim = Number(cfgJornada?.horario_fim) || 20 * 60;
    const duracao = duracaoMinutos(servico as Servico, horas);
    const inicioMin = horaParaMin(hora);
    const multiDia = ehMultiDia(duracao, wIni, wFim);

    if (multiDia) {
      if (duracao > MAX_DURACAO_DIAS * 1440) {
        return NextResponse.json({
          error: `Duração máxima suportada é de ${MAX_DURACAO_DIAS} dias.`,
        }, { status: 400 });
      }
      if (inicioMin !== wIni) {
        return NextResponse.json({
          error: `Este serviço dura mais de um dia de expediente — só pode iniciar às ${formatarMinuto(wIni)}.`,
        }, { status: 400 });
      }
    } else if (inicioMin < wIni || inicioMin + duracao > wFim) {
      return NextResponse.json({ error: "Horário fora do expediente." }, { status: 400 });
    }

    // ---- Plano grátis: limite mensal (exclui cancelados) ----
    const { plano, ativo } = await getPlanoAtivo(prof.id);
    if (plano === "gratis" || !ativo) {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const { count, error: countError } = await adminDb
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("profissional_id", prof.id)
        .gte("created_at", inicioMes.toISOString())
        .neq("status", "cancelado");

      if (countError) {
        console.error("Erro ao contar agendamentos:", countError);
      } else if ((count || 0) >= AGENDAMENTOS_GRATIS_POR_MES) {
        return NextResponse.json({
          error: `Seu plano grátis permite ${AGENDAMENTOS_GRATIS_POR_MES} agendamentos por mês. Faça upgrade em /${slug}/painel/plano.`,
          upgrade: true,
        }, { status: 403 });
      }
    }

    // ---- Limite diário ----
    const { data: config } = await adminDb
      .from("configuracoes")
      .select("max_agendamentos_dia")
      .eq("profissional_id", prof.id)
      .single();

    const maxDia = Number(config?.max_agendamentos_dia) || 0;
    if (maxDia > 0) {
      const { count } = await adminDb
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("profissional_id", prof.id)
        .eq("data", data)
        .neq("status", "cancelado");

      if ((count || 0) >= maxDia) {
        return NextResponse.json({
          error: "Esse dia já atingiu o limite de agendamentos. Escolha outra data.",
          limite: true,
        }, { status: 409 });
      }
    }

    // ---- Conflito por SOBREPOSIÇÃO de duração (não só hora exata) ----
    // Serviços multi-dia bloqueiam o dia inteiro em cada dia que ocupam.
    const minhasDatas = multiDia ? diasDaFaixa(data, inicioMin, duracao) : [data];
    const { data: doDia } = await adminDb
      .from("agendamentos")
      .select("data, hora, servico_id, horas")
      .eq("profissional_id", prof.id)
      .gte("data", somarDiasISO(data, -MAX_DURACAO_DIAS))
      .lte("data", data)
      .neq("status", "cancelado");

    const servicosDia = await adminDb.from("servicos").select("id, tipo_preco, duracao_minutos");
    const durMap = new Map<string, number>();
    for (const s of servicosDia.data || []) {
      if (s.tipo_preco === "fixo" && s.duracao_minutos) durMap.set(s.id, s.duracao_minutos);
    }

    const conflito = (doDia || []).some((a) => {
      if (!a.hora) return false;
      const aIni = horaParaMin(a.hora);
      const aDur = durMap.get(a.servico_id) || Math.max(30, Math.round((Number(a.horas) || 1) * 60));
      const aMulti = ehMultiDia(aDur, wIni, wFim);
      const aDatas = aMulti ? diasDaFaixa(a.data, aIni, aDur) : [a.data];
      return aDatas.some((ad) => {
        if (!minhasDatas.includes(ad)) return false;
        const meuIni = multiDia ? 0 : inicioMin;
        const meuFim = multiDia ? 1440 : inicioMin + duracao;
        const delIni = aMulti ? 0 : aIni;
        const delFim = aMulti ? 1440 : aIni + aDur;
        return meuIni < delFim && meuFim > delIni;
      });
    });

    if (conflito) {
      return NextResponse.json({
        error: "Esse horário já foi reservado. Escolha outro.",
        conflito: true,
      }, { status: 409 });
    }

    const supabase = await createClient();

    // ---- Create or get cliente ----
    let clienteId: string | null = null;
    if (whatsapp) {
      const { data: existing } = await supabase
        .from("clientes")
        .select("id")
        .eq("profissional_id", prof.id)
        .eq("whatsapp", whatsapp)
        .maybeSingle();

      if (existing) {
        clienteId = existing.id;
      } else {
        const { data: newCliente } = await supabase
          .from("clientes")
          .insert({
            profissional_id: prof.id,
            nome: cliente_nome.trim(),
            whatsapp,
            endereco: cliente_endereco || null,
          })
          .select("id")
          .single();
        clienteId = newCliente?.id || null;
      }
    }

    // ---- Create agendamento ----
    const { data: agendamento, error } = await supabase
      .from("agendamentos")
      .insert({
        profissional_id: prof.id,
        cliente_id: clienteId,
        servico_id: servico_id || null,
        servico_nome: servico.nome,
        cliente_nome: sanitizeTexto(cliente_nome),
        cliente_whatsapp: whatsapp,
        cliente_endereco: sanitizeTexto(cliente_endereco) || null,
        data,
        hora,
        horas,
        valor,
        status: "confirmado",
        adicionais: Array.isArray(adicionais) ? adicionais : [],
        recorrencia: frequenciaDb?.slug || null,
        observacoes: sanitizeTexto(body.observacoes),
        token_avaliacao: crypto.randomUUID(),
        consentimento_lgpd: true,
        consentimento_data: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      // Race condition: outra reserva entrou no mesmo horário exato
      if (String(error.message).toLowerCase().includes("duplicate")) {
        return NextResponse.json({
          error: "Esse horário acabou de ser reservado. Escolha outro.",
          conflito: true,
        }, { status: 409 });
      }
      console.error("Erro ao criar agendamento:", error);
      return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
    }

    // ---- Notificações (best-effort, nunca quebram a reserva) ----
    try {
      const { enviarConfirmacao } = await import("@/lib/notificacoes");
      await enviarConfirmacao({
        profissional_id: prof.id,
        cliente_whatsapp: whatsapp,
        servico_nome: servico.nome,
        data,
        hora,
        valor,
        endereco: cliente_endereco || null,
      });
    } catch (err) {
      console.warn("Confirmação automática não enviada:", err);
    }

    try {
      const { enviarNotificacaoProfissional } = await import("@/lib/notificacoes");
      await enviarNotificacaoProfissional({
        profissional_id: prof.id,
        cliente_nome: cliente_nome.trim(),
        servico_nome: servico.nome,
        adicionais: Array.isArray(adicionais) ? adicionais : [],
        data,
        hora,
        valor,
      });
    } catch (err) {
      console.warn("Notificação ao profissional não enviada:", err);
    }

    try {
      const { enviarPushProfissional } = await import("@/lib/push-server");
      await enviarPushProfissional(
        prof.id,
        "📩 Nova solicitação de agendamento",
        `${cliente_nome.trim()} — ${servico.nome}${hora ? ` às ${hora.slice(0, 5)}` : ""}`,
        `/${slug}/painel/agendamentos`
      );
    } catch (err) {
      console.warn("Push ao painel não enviado:", err);
    }

    return NextResponse.json({ success: true, agendamento_id: agendamento.id });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
