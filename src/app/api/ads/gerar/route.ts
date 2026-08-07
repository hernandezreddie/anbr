import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoProfissional } from "@/lib/auth-roles";
import {
  getPlanoAtivo,
  PLANOS_COM_AGENTE,
  PLANOS_COM_DOMINIO,
  AGENDAMENTOS_GRATIS_POR_MES,
} from "@/lib/planos";
import {
  gerarBriefBasico,
  gerarCopysAnuncio,
  gerarCopysParaAI,
  validarCopys,
  type CampanhaBrief,
  type CopysAnuncio,
  type RecursosPlano,
} from "@/lib/ai/ads";
import { resolveApiKey } from "@/lib/ai/agent";

const OBJETIVOS: CampanhaBrief["objetivo"][] = ["agendamentos", "seguidores", "promocao", "recuperacao"];

export async function GET(request: NextRequest) {
  const profissional_id = request.nextUrl.searchParams.get("profissional_id");
  if (!profissional_id) {
    return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 });
  }

  const acesso = await verificarAcessoProfissional(profissional_id);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { plano, nome, ativo, expira_em } = await getPlanoAtivo(profissional_id);
  return NextResponse.json({
    plano,
    nome,
    ativo,
    expira_em,
    limiteMensalGratis: plano === "gratis" ? AGENDAMENTOS_GRATIS_POR_MES : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profissional_id, servico_id, objetivo } = body;

  if (!profissional_id || !servico_id) {
    return NextResponse.json({ error: "profissional_id e servico_id são obrigatórios" }, { status: 400 });
  }
  if (!OBJETIVOS.includes(objetivo)) {
    return NextResponse.json({ error: "Objetivo inválido" }, { status: 400 });
  }

  const acesso = await verificarAcessoProfissional(profissional_id);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const adminDb = createAdminClient();

  const [{ data: prof }, { data: servico }, { data: agentConfig }, planoAtivo] = await Promise.all([
    adminDb
      .from("profissionais")
      .select("nome, cidade, categoria, slug")
      .eq("id", profissional_id)
      .single(),
    adminDb
      .from("servicos")
      .select("nome, tipo_preco, preco_fixo, valor_hora, duracao_minutos")
      .eq("id", servico_id)
      .eq("profissional_id", profissional_id)
      .eq("ativo", true)
      .single(),
    adminDb.from("agent_configs").select("api_keys, model").eq("profissional_id", profissional_id).maybeSingle(),
    getPlanoAtivo(profissional_id),
  ]);

  if (!servico) {
    return NextResponse.json({ error: "Serviço inválido ou inativo" }, { status: 400 });
  }

  const preco =
    servico.tipo_preco === "fixo"
      ? `R$ ${Number(servico.preco_fixo).toFixed(0)}`
      : `R$ ${Number(servico.valor_hora).toFixed(0)}/h`;
  const duracao = `${servico.duracao_minutos || 60}min`;
  const categoria = prof?.categoria || "Serviços";
  const cidade = prof?.cidade || "sua cidade";
  const diferencial = prof?.nome ? `${prof.nome} — ${categoria} profissional` : "Atendimento de qualidade";

  const brief = gerarBriefBasico(servico.nome, preco, duracao, categoria, cidade, diferencial, objetivo);

  const recursosPlano: RecursosPlano = {
    plano: planoAtivo.nome,
    agendamentoOnline: true,
    agenteWhatsApp: PLANOS_COM_AGENTE.includes(planoAtivo.plano),
    dominioProprio: PLANOS_COM_DOMINIO.includes(planoAtivo.plano),
    limiteMensalGratis: planoAtivo.plano === "gratis" ? AGENDAMENTOS_GRATIS_POR_MES : null,
  };

  // ---- IA real (chave do tenant ou do servidor), fallback para templates ----
  const model = agentConfig?.model || "gpt-4o-mini";
  const apiKey = resolveApiKey(agentConfig, model) || process.env.OPENAI_API_KEY;

  if (apiKey && model.toLowerCase().startsWith("gpt")) {
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: gerarCopysParaAI(brief, recursosPlano),
      });

      const raw = completion.choices[0]?.message?.content;
      const copys = raw ? validarCopys(JSON.parse(raw)) : null;
      if (copys) {
        return NextResponse.json({
          copys,
          origem: "ia",
          model,
          plano: planoAtivo.nome,
          limiteMensalGratis: recursosPlano.limiteMensalGratis,
          slug: prof?.slug || null,
        });
      }
    } catch (err) {
      console.error("AI Ads falhou, usando template:", err);
    }
  }

  // ---- Fallback: templates locais (coerentes com o plano) ----
  const copys: CopysAnuncio = gerarCopysAnuncio(brief);
  if (recursosPlano.limiteMensalGratis) {
    copys.dicas.push(
      `Seu plano grátis permite ${recursosPlano.limiteMensalGratis} agendamentos/mês — antes de lançar uma campanha grande, considere o Profissional (R$ 49) em /${prof?.slug || "seu-slug"}/painel/plano`
    );
  }
  if (!recursosPlano.agenteWhatsApp) {
    copys.dicas.push("Responda os comentários e mensagens o quanto antes — sua agilidade vale o clique");
  }

  return NextResponse.json({
    copys,
    origem: "template",
    plano: planoAtivo.nome,
    limiteMensalGratis: recursosPlano.limiteMensalGratis,
    slug: prof?.slug || null,
  });
}
