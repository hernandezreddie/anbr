import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Termos de Uso | AN.BR",
  description:
    "Termos e condições de uso da plataforma de agendamento online AN.BR. Ao utilizar nossos serviços, você concorda com os termos descritos nesta página.",
};

const sections = [
  {
    title: "1. Definições",
    content:
      "Para os fins destes Termos de Uso, considera-se:",
    items: [
      "Plataforma: o sistema de agendamento online AN.BR, acessível pelo domínio autonexabrasil.com.br",
      "Usuário / Prestador: pessoa física ou jurídica que se cadastra na plataforma para oferecer e gerenciar seus serviços",
      "Cliente: pessoa que utiliza a página do Prestador para agendar serviços",
      "Serviço: a solução de software como serviço (SaaS) de agendamento online, página profissional, gestão de agenda e funcionalidades correlatas",
    ],
  },
  {
    title: "2. Descrição do serviço",
    content:
      "O AN.BR é uma plataforma SaaS que permite ao Profissional criar uma página web profissional para exibir seus serviços, receber agendamentos online, gerenciar sua agenda, comunicar-se com clientes via WhatsApp e receber pagamentos por meio de Pix e outras formas de cobrança. A plataforma oferece diferentes planos, incluindo opção gratuita e planos pagos com funcionalidades adicionais.",
  },
  {
    title: "3. Cadastro e conta",
    content:
      "Para utilizar a plataforma, o Usuário deve realizar um cadastro fornecendo informações verdadeiras, precisas e atualizadas.",
    items: [
      "O Usuário é o único responsável pela guarda e sigilo de suas credenciais de acesso (e-mail e senha)",
      "O Usuário responde integralmente por todas as atividades realizadas em sua conta",
      "O cadastro é pessoal e intransferível, não sendo permitido ceder, emprestar ou vender a conta a terceiros",
      "O AN.BR se reserva o direito de recusar ou cancelar cadastros a seu critério, em caso de descumprimento destes termos",
      "O Usuário deve ter capacidade civil plena para contratar os serviços",
    ],
  },
  {
    title: "4. Planos e pagamentos",
    content:
      "O AN.BR oferece planos gratuitos e planos pagos. Os valores dos planos pagos são expressos em Reais (R$).",
    items: [
      "O plano gratuito pode ser utilizado sem custos, com funcionalidades limitadas conforme descrito na página de Preços",
      "Os planos pagos concedem acesso a funcionalidades adicionais mediante pagamento de assinatura mensal ou anual",
      "Os preços podem ser alterados a qualquer momento, mediante comunicação prévia aos Usuários",
      "O não pagamento da assinatura dentro do prazo poderá resultar na suspensão ou cancelamento do acesso às funcionalidades pagas",
      "Não há reembolso de valores pagos por períodos de assinatura já iniciados, salvo disposição legal em contrário",
    ],
  },
  {
    title: "5. Obrigações do Profissional",
    content:
      "Ao utilizar a plataforma, o Profissional se compromete a:",
    items: [
      "Fornecer informações verdadeiras, completas e atualizadas sobre si e seus serviços",
      "Utilizar a plataforma de forma ética e em conformidade com a legislação aplicável",
      "Não divulgar conteúdos ofensivos, discriminatórios, ilegais ou que violem direitos de terceiros",
      "Cumprir os agendamentos realizados por meio da plataforma, assumindo integral responsabilidade pela prestação do serviço contratado pelo Cliente",
      "Não utilizar a plataforma para práticas fraudulentas ou abusivas",
      "Respeitar as leis de proteção de dados ao coletar informações de seus Clientes",
    ],
  },
  {
    title: "6. Limitação de responsabilidade",
    content:
      "O AN.BR atua como plataforma tecnológica de intermediação entre Profissionais e Clientes. A responsabilidade do AN.BR se limita ao funcionamento adequado da plataforma, nos termos da legislação aplicável.",
    items: [
      "O AN.BR não é responsável pela qualidade, execução ou descumprimento dos serviços prestados pelo Profissional ao Cliente",
      "O AN.BR não se responsabiliza por danos decorrentes de caso fortuito, força maior ou fatos de terceiros",
      "A plataforma pode apresentar indisponibilidades temporárias para manutenção ou por motivos técnicos alheios ao seu controle",
      "O AN.BR não garante que a plataforma seja livre de erros, vírus ou outros componentes nocivos",
    ],
  },
  {
    title: "7. Propriedade intelectual",
    content:
      "Todo o código, design, logotipos, marcas, textos, imagens e demais elementos visuais e funcionais da plataforma AN.BR são de propriedade exclusiva do AN.BR ou de seus licenciantes.",
    items: [
      "O Usuário não adquire qualquer direito de propriedade intelectual sobre a plataforma",
      "O conteúdo inserido pelo Usuário em sua página (textos, fotos, logo) continua sendo de sua propriedade, concedendo ao AN.BR licença não exclusiva para exibi-lo na plataforma",
      "É vedada a reprodução, distribuição, modificação ou engenharia reversa da plataforma sem autorização expressa",
    ],
  },
  {
    title: "8. Rescisão",
    content:
      "O Usuário pode cancelar sua conta a qualquer momento por meio do painel de controle ou entrando em contato com o suporte.",
    items: [
      "O AN.BR pode suspender ou cancelar o acesso do Usuário que viole estes Termos de Uso ou a legislação aplicável",
      "Em caso de rescisão por descumprimento contratual, não haverá devolução de valores eventualmente pagos",
      "Após o cancelamento, o AN.BR poderá manter os dados do Usuário pelo período exigido por lei",
    ],
  },
  {
    title: "9. Proteção de dados (LGPD)",
    content:
      "O tratamento de dados pessoais realizado pelo AN.BR segue os princípios e garantias estabelecidos pela Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).",
    items: [
      "As informações sobre coleta, uso, armazenamento e direitos dos titulares estão descritas na Política de Privacidade",
      "O Profissional é responsável por obter o consentimento de seus Clientes para o tratamento de dados pessoais quando exigido por lei",
      "O AN.BR emprega medidas de segurança técnicas e organizacionais para proteger os dados contra acessos não autorizados",
    ],
    extra:
      "Consulte nossa Política de Privacidade para informações detalhadas sobre o tratamento de dados pessoais.",
  },
  {
    title: "10. Disposições gerais",
    content:
      "Estes Termos de Uso são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Curitiba, Estado do Paraná, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias decorrentes destes termos.",
    items: [
      "A tolerância quanto ao descumprimento de qualquer cláusula não constituirá novação ou precedente",
      "Caso qualquer disposição seja considerada inválida ou inexequível, as demais permanecerão em pleno vigor",
      "Estes termos podem ser alterados a qualquer momento, mediante comunicação aos Usuários",
    ],
  },
];

export default function TermosPage() {
  return (
    <div className="bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/50 bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg"><Logo className="h-8 w-8" /></span>
            <span className="font-serif text-xl">AN.BR</span>
          </a>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Título */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              Termos e Condições
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Termos de Uso
            </h1>
            <p className="mt-3 text-ink-soft">
              Última atualização: julho de 2026
            </p>
          </div>

          {/* Seções */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="card rounded-2xl p-6 sm:p-8">
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {section.title}
                </h2>
                <p className="mt-3 text-ink-soft leading-relaxed">
                  {section.content}
                </p>
                {section.items && (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.extra && (
                  <p className="mt-3 text-ink-soft leading-relaxed">
                    {section.extra}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Foro destaque */}
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6 text-center sm:p-8">
            <p className="text-sm text-ink-soft leading-relaxed">
              Estes Termos de Uso são regidos pela legislação brasileira. Fica eleito o foro da
              Comarca de Curitiba, Estado do Paraná, para dirimir quaisquer controvérsias
              decorrentes destes termos.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md"><Logo className="h-7 w-7" /></span>
              <span className="font-serif text-base font-semibold">AN.BR</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
              <a href="/termos" className="underline underline-offset-2 hover:text-ink transition-colors">
                Termos de Uso
              </a>
              <a href="/privacidade" className="underline underline-offset-2 hover:text-ink transition-colors">
                Privacidade
              </a>
              <a href="/precos" className="underline underline-offset-2 hover:text-ink transition-colors">
                Preços
              </a>
            </div>
            <p className="text-sm text-ink-soft">
              &copy; {new Date().getFullYear()} AN.BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

