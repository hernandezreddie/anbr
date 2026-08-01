import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getPlanoAtivo, AGENDAMENTOS_GRATIS_POR_MES } from "@/lib/planos";

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
        .select("hora, servico_id, horas")
        .eq("profissional_id", prof.id)
        .eq("data", data)
        .neq("status", "cancelado"),
      supabase.from("servicos").select("id, tipo_preco, duracao_minutos"),
      supabase
        .from("configuracoes")
        .select("max_agendamentos_dia")
        .eq("profissional_id", prof.id)
        .single(),
    ]);

    const durPorServico = new Map<string, number>();
    for (const s of servicos.data || []) {
      if (s.tipo_preco === "fixo" && s.duracao_minutos) {
        durPorServico.set(s.id, s.duracao_minutos);
      }
    }

    const ocupados = (ags.data || [])
      .filter((a) => a.hora)
      .map((a) => {
        const minutos =
          durPorServico.get(a.servico_id) ||
          Math.max(30, Math.round((Number(a.horas) || 1) * 60));
        return { inicio: a.hora.slice(0, 5), minutos };
      });

    return NextResponse.json({
      ocupados,
      max_agendamentos_dia: Number(config.data?.max_agendamentos_dia) || 0,
      total_dia: ags.data?.length || 0,
    });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      slug, 
      servico_id, 
      adicionais, 
      frequencia, 
      horas, 
      valor, 
      data, 
      hora, 
      cliente_nome, 
      cliente_whatsapp, 
      cliente_endereco,
      consentimento
    } = body;

    if (!consentimento) {
      return NextResponse.json(
        { error: "É necessário aceitar os Termos de Uso e a Política de Privacidade (LGPD) para agendar." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get profissional_id from slug
    const { data: prof } = await supabase
      .from("profissionais")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!prof) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    // Plano grátis: limite mensal de agendamentos
    const adminDb = createAdminClient();
    const { plano, ativo } = await getPlanoAtivo(prof.id);
    if (plano === "gratis" || !ativo) {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const { count, error: countError } = await adminDb
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("profissional_id", prof.id)
        .gte("created_at", inicioMes.toISOString());

      if (countError) {
        console.error("Erro ao contar agendamentos:", countError);
      } else if ((count || 0) >= AGENDAMENTOS_GRATIS_POR_MES) {
        return NextResponse.json({
          error: `Seu plano grátis permite ${AGENDAMENTOS_GRATIS_POR_MES} agendamentos por mês. Faça upgrade em /${slug}/painel/plano.`,
          upgrade: true,
        }, { status: 403 });
      }
    }

    // Limite diário configurado pelo profissional
    if (data) {
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
    }

    // Conflito de horário: impede duas reservas no mesmo horário
    if (data && hora) {
      const { count, error: conflitoError } = await adminDb
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("profissional_id", prof.id)
        .eq("data", data)
        .eq("hora", hora)
        .neq("status", "cancelado");

      if (!conflitoError && (count || 0) > 0) {
        return NextResponse.json({
          error: "Esse horário já foi reservado. Escolha outro.",
          conflito: true,
        }, { status: 409 });
      }
    }

    // Create or get cliente
    let clienteId: string | null = null;
    if (cliente_whatsapp) {
      const { data: existing } = await supabase
        .from("clientes")
        .select("id")
        .eq("profissional_id", prof.id)
        .eq("whatsapp", cliente_whatsapp)
        .single();
      
      if (existing) {
        clienteId = existing.id;
      } else {
        const { data: newCliente } = await supabase
          .from("clientes")
          .insert({
            profissional_id: prof.id,
            nome: cliente_nome,
            whatsapp: cliente_whatsapp,
            endereco: cliente_endereco || null,
          })
          .select("id")
          .single();
        clienteId = newCliente?.id || null;
      }
    }

    // Create agendamento
    const { data: agendamento, error } = await supabase
      .from("agendamentos")
      .insert({
        profissional_id: prof.id,
        cliente_id: clienteId,
        servico_id: servico_id || null,
        cliente_nome,
        cliente_whatsapp,
        cliente_endereco: cliente_endereco || null,
        data,
        hora,
        horas,
        valor,
        status: "solicitado",
        adicionais: adicionais || [],
        recorrencia: frequencia?.slug || null,
        token_avaliacao: crypto.randomUUID(),
        consentimento_lgpd: true,
        consentimento_data: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar agendamento:", error);
      return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
    }

    try {
      const { data: servico } = servico_id
        ? await adminDb.from("servicos").select("nome").eq("id", servico_id).single()
        : { data: null };
      const { enviarConfirmacao } = await import("@/lib/notificacoes");
      await enviarConfirmacao({
        profissional_id: prof.id,
        cliente_whatsapp,
        servico_nome: servico?.nome ?? null,
        data,
        hora,
      });
    } catch (err) {
      console.warn("Confirmação automática não enviada:", err);
    }

    return NextResponse.json({ success: true, agendamento_id: agendamento.id });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}