export function linkWhatsApp(mensagem: string, telefone: string) {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

export function mensagemReserva(
  profissionalNome: string,
  d: {
    nome: string;
    servico: string;
    adicionais: string[];
    horas: number;
    endereco?: string;
    cep?: string;
    data?: string;
    hora?: string;
    frequencia: string;
    total: number;
  },
) {
  return [
    `Olá ${profissionalNome}! 👋 Quero agendar um serviço:`,
    ``,
    `👤 ${d.nome}`,
    `🧼 ${d.servico}`,
    d.adicionais.length ? `➕ Adicionais: ${d.adicionais.join(", ")}` : "",
    `⏱️ Duração estimada: ${d.horas}h`,
    d.endereco ? `📍 ${d.endereco}${d.cep ? ` (CEP ${d.cep})` : ""}` : "",
    d.data ? `📅 ${d.data}${d.hora ? ` às ${d.hora}` : ""}` : "",
    `🔁 Frequência: ${d.frequencia}`,
    ``,
    `💰 Valor estimado: ${fmt(d.total)}`,
    `Podemos confirmar? 😊`,
  ]
    .filter(Boolean)
    .join("\n");
}
