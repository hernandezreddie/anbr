export type MsgCtx = {
  nome: string;
  quando: string;
  valor: string;
  servico: string;
};

export type ModeloMensagem = {
  id: string;
  titulo: string;
  texto: (c: MsgCtx, profissional: { primeiroNome: string; pixChave: string; pixNome: string }) => string;
};

const primeiroNome = (nome: string) => (nome || "").trim().split(/\s+/)[0] || "";

export const MODELOS_MENSAGEM: ModeloMensagem[] = [
  {
    id: "confirmar",
    titulo: "Confirmar agendamento",
    texto: (c, p) =>
      `Oi ${primeiroNome(c.nome)}, tudo bem? Aqui é a ${p.primeiroNome}. ` +
      `Já deixei seu serviço marcado para ${c.quando} e vou cuidar de tudo com muito carinho. ` +
      `Se precisar mudar alguma coisa, é só me falar por aqui. 😊`,
  },
  {
    id: "lembrete",
    titulo: "Lembrete da véspera",
    texto: (c, p) =>
      `Oi ${primeiroNome(c.nome)}, tudo bem? Passando só para lembrar do nosso serviço ${c.quando}. ` +
      `Está tudo certo para você? Qualquer coisa a gente ajeita. 💚`,
  },
  {
    id: "caminho",
    titulo: "Estou a caminho",
    texto: (c, p) =>
      `Oi ${primeiroNome(c.nome)}! Já estou a caminho, chego pertinho do horário. ` +
      `Vou deixar tudo limpinho e cheiroso. Até já! 😊`,
  },
  {
    id: "concluido",
    titulo: "Concluí + cobrança Pix",
    texto: (c, p) =>
      `${primeiroNome(c.nome)}, terminei tudo por aqui! Deixei tudo limpinho e cheiroso, ` +
      `espero de coração que você goste. O valor que combinamos foi ${c.valor} — quando puder, ` +
      `pode fazer o Pix na chave ${p.pixChave} (em nome de ${p.pixNome}). ` +
      `Muito obrigada pela confiança, viu? 💚`,
  },
  {
    id: "agradecer",
    titulo: "Agradecer",
    texto: (c, p) =>
      `${primeiroNome(c.nome)}, foi um prazer cuidar de tudo hoje! ` +
      `Qualquer coisa que precisar, é só me chamar. Obrigada pela confiança de sempre. 💚`,
  },
  {
    id: "reagendar",
    titulo: "Reservar a próxima",
    texto: (c, p) =>
      `Oi ${primeiroNome(c.nome)}, tudo bem? Já faz um tempinho da última vez e fiquei ` +
      `pensando em você. Quer que eu já reserve um horário? Me diz o melhor dia que eu separo. 😊`,
  },
];