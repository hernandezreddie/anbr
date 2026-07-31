import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getPlanoAtivo, AGENDAMENTOS_GRATIS_POR_MES } from "@/lib/planos";

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
      cliente_endereco 
    } = body;

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
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar agendamento:", error);
      return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
    }

    return NextResponse.json({ success: true, agendamento_id: agendamento.id });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}