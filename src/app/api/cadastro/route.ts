import { createAdminClient } from "@/lib/supabase/admin";
import {
  getServicosPadrao,
  getSloganPadrao,
  getFrequenciasPadrao,
  getAdicionaisPadrao,
  getCategoriaPadrao,
} from "@/lib/servicos-padrao";
import type { CategoriaId } from "@/lib/servicos-padrao";
import { gerarLogoSVG } from "@/lib/logo-padrao";

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, email, senha, slug, whatsapp, cidade, pix_chave, servicos, slogan, template_id, categoria } = body;

  if (!nome || !email || !senha || !slug) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, slug },
  });

  if (authError || !authUser.user) {
    return Response.json({ error: authError?.message || "Erro ao criar usuário" }, { status: 400 });
  }

  const pix_nome = nome.toUpperCase();
  const pix_cidade = cidade?.toUpperCase() || "NAO INFORMADA";

  const { data: prof, error: profError } = await supabase
    .from("profissionais")
    .insert({
      slug,
      nome,
      slogan: slogan || `${nome} — Profissional de confiança`,
      cidade: cidade || "",
      email,
      whatsapp: whatsapp || "",
      pix_chave: pix_chave || email,
      pix_nome,
      pix_cidade,
    })
    .select()
    .single();

  if (profError || !prof) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return Response.json({ error: profError?.message || "Erro ao criar profissional" }, { status: 500 });
  }

  if (categoria) {
    const { error: catError } = await supabase
      .from("profissionais")
      .update({ categoria })
      .eq("id", prof.id);
    if (catError) {
      console.warn("Categoria não salva (coluna ausente?):", catError.message);
    }
  }

  await supabase.from("configuracoes").insert({
    profissional_id: prof.id,
    template_id: template_id || 1,
    slogan: slogan || `${nome} — Profissional de confiança`,
  });

  await supabase.from("profiles").insert({
    id: authUser.user.id,
    profissional_id: prof.id,
    role: "owner",
  });

  try {
    const svg = gerarLogoSVG(nome, Number(template_id) || 1);
    const logoNome = `${prof.id}/logo.svg`;
    const { error: logoError } = await supabase.storage
      .from("logos")
      .upload(logoNome, svg, { upsert: true, contentType: "image/svg+xml" });
    if (!logoError) {
      const { data: url } = supabase.storage.from("logos").getPublicUrl(logoNome);
      await supabase
        .from("configuracoes")
        .update({ logo_url: url.publicUrl })
        .eq("profissional_id", prof.id);
    } else {
      console.warn("Logo padrão não criado:", logoError.message);
    }
  } catch (e) {
    console.warn("Falha ao criar logo padrão:", e);
  }

  if (servicos && servicos.length > 0) {
    for (const s of servicos) {
      await supabase.from("servicos").insert({
        profissional_id: prof.id,
        nome: s.nome || "Serviço",
        descricao: s.descricao || "",
        descricao_curta: s.descricao_curta || s.descricao || "",
        horas_base: s.tipo_preco === "por_hora" ? (s.horas_base || s.horas_minimas || 1) : 0,
        valor_hora: s.tipo_preco === "por_hora" ? (s.valor_hora || 25) : 0,
        horas_minimas: s.tipo_preco === "por_hora" ? (s.horas_minimas || 1) : 0,
        preco_fixo: s.tipo_preco === "fixo" ? (s.preco_fixo || 0) : 0,
        duracao_minutos: s.duracao_minutos || 60,
        tipo_preco: s.tipo_preco || "por_hora",
        ordem: s.ordem || 1,
      });
    }
  } else if (categoria) {
    const servicosCat = getServicosPadrao(categoria as CategoriaId);
    for (let i = 0; i < servicosCat.length; i++) {
      const s = servicosCat[i];
      await supabase.from("servicos").insert({
        profissional_id: prof.id,
        nome: s.nome,
        descricao: s.descricao,
        descricao_curta: s.descricao,
        horas_base: s.tipo_preco === "por_hora" ? s.horas_minimas : 0,
        valor_hora: s.tipo_preco === "por_hora" ? s.valor_hora : 0,
        horas_minimas: s.tipo_preco === "por_hora" ? s.horas_minimas : 0,
        preco_fixo: s.tipo_preco === "fixo" ? s.preco_fixo : 0,
        duracao_minutos: s.duracao_minutos,
        tipo_preco: s.tipo_preco,
        ordem: i + 1,
      });
    }
  } else {
    const servicosPadrao = [
      { nome: "Serviço Básico", descricao: "Atendimento padrão", descricao_curta: "Serviço essencial", horas_base: 2, valor_hora: 25, horas_minimas: 2, tipo_preco: "por_hora", preco_fixo: 0, duracao_minutos: 60, ordem: 1 },
      { nome: "Serviço Completo", descricao: "Atendimento completo e detalhado", descricao_curta: "Recomendado", horas_base: 3, valor_hora: 30, horas_minimas: 3, tipo_preco: "por_hora", preco_fixo: 0, duracao_minutos: 60, ordem: 2 },
    ];
    for (const s of servicosPadrao) {
      await supabase.from("servicos").insert({ profissional_id: prof.id, ...s });
    }
  }

  const frequenciasPadrao = [
    { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
    { nome: "Mensal", slug: "mensal", desconto: 5, ordem: 2 },
    { nome: "Quinzenal", slug: "quinzenal", desconto: 10, ordem: 3 },
    { nome: "Semanal", slug: "semanal", desconto: 15, ordem: 4 },
  ];

  const cat = categoria ? getCategoriaPadrao(categoria as CategoriaId) : undefined;
  const frequencias = cat?.frequencias?.length ? cat.frequencias : frequenciasPadrao;
  for (const f of frequencias) {
    await supabase.from("frequencias").insert({ profissional_id: prof.id, ...f });
  }

  const adicionais = cat?.adicionais ?? [];
  for (const a of adicionais) {
    await supabase.from("adicionais").insert({
      profissional_id: prof.id,
      nome: a.nome,
      descricao: "",
      preco: a.preco,
      horas: a.horas,
      ativo: true,
    });
  }

  return Response.json({ slug, nome });
}
