import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANOS, formatarBRL } from "@/lib/planos";
import { gerarPixCopiaECola } from "@/lib/pix";
import { criarPixCobranca, getConfigGateway } from "@/lib/pagamentos/mercadopago";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { plano, frequencia } = await req.json();

  if (!plano || !PLANOS[plano as keyof typeof PLANOS] || plano === "gratis") {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }
  const freq = frequencia === "anual" ? "anual" : "mensal";

  const adminDb = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("profissional_id")
    .eq("id", user.id)
    .single();
  if (!profile?.profissional_id) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 400 });
  }

  const { data: config } = await adminDb
    .from("config_plataforma")
    .select("pix_chave, pix_nome, pix_cidade")
    .eq("id", 1)
    .single();

  if (!config || !config.pix_chave) {
    return NextResponse.json({ error: "Chave Pix da plataforma não configurada. Fale com o suporte." }, { status: 400 });
  }

  const info = PLANOS[plano as keyof typeof PLANOS];
  const valor = freq === "anual" ? Math.round(info.precoMensal * 12 * 0.8) : info.precoMensal;
  const descricao = `PLANO ${info.nome.toUpperCase()} ${freq === "anual" ? "ANUAL" : "MENSAL"}`;
  const externalRef = `ANBR${Date.now().toString().slice(-12)}`;

  const gateway = getConfigGateway();
  let paymentId: string | null = null;
  let qrCodeBase64: string | null = null;
  let copiaECola = "";
  let expiraEm: string | null = null;
  let txid: string | null = null;

  if (gateway.ativo) {
    // 1) Gateway (Mercado Pago): PIX dinâmico com expiração de 30 min
    try {
      const cobranca = await criarPixCobranca({
        valor,
        descricao,
        external_reference: externalRef,
        payer_email: user.email || "cliente@anbr.com.br",
        expires_minutes: 30,
      });
      paymentId = cobranca.payment_id;
      qrCodeBase64 = cobranca.qr_code_base64;
      copiaECola = cobranca.copia_e_cola;
      expiraEm = cobranca.expires_at;
      txid = cobranca.payment_id;
    } catch (e) {
      console.error("[planos/pedido] gateway falhou, caindo para Pix manual:", String(e));
    }
  }

  // 2) Fallback: Pix estático (copia e cola gerado localmente, ativação manual)
  if (!paymentId) {
    copiaECola = gerarPixCopiaECola({
      chave: config.pix_chave,
      nome: config.pix_nome || "AN.BR",
      cidade: config.pix_cidade || "BRASIL",
      valor,
      descricao,
      txid: externalRef,
    });
    txid = externalRef;
  }

  const { data: pagamento, error } = await adminDb
    .from("pagamentos_pix")
    .insert({
      profissional_id: profile.profissional_id,
      plano,
      frequencia: freq,
      valor,
      pix_copia_e_cola: copiaECola,
      payment_id: paymentId,
      pix_qr_code_base64: qrCodeBase64,
      txid,
      pix_chave: config.pix_chave,
      expira_em: expiraEm,
    })
    .select("id")
    .single();

  if (error || !pagamento) {
    return NextResponse.json({ error: error?.message || "Erro ao gerar pedido" }, { status: 500 });
  }

  const gatewayNome = paymentId ? "mercadopago" : "manual";
  return NextResponse.json({
    pagamento_id: pagamento.id,
    valor,
    valor_formatado: formatarBRL(valor),
    pix_copia_e_cola: copiaECola,
    pix_qr_code_base64: qrCodeBase64,
    expira_em: expiraEm,
    payment_id: paymentId,
    gateway: gatewayNome,
    plano_nome: info.nome,
    frequencia: freq,
    instrucoes:
      gatewayNome === "mercadopago"
        ? "Aponte a câmera do app do seu banco para o QR Code ou copie o código Pix Copia e Cola. Seu plano é ativado automaticamente em segundos após o pagamento."
        : "Aponte a câmera do app do seu banco para o QR Code ou copie o código Pix Copia e Cola. Após o pagamento, o suporte ativa seu plano em até 1 dia útil.",
  });
}
