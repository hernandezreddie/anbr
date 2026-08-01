import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Política de Privacidade | AN.BR",
  description:
    "Saiba como o AN.BR coleta, usa e protege seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).",
};

const sections = [
  {
    title: "1. Introdução",
    content:
      "A sua privacidade é importante para nós. Esta Política de Privacidade descreve como o AN.BR trata as informações pessoais coletadas por meio da plataforma disponível em autonexabrasil.com.br, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).",
  },
  {
    title: "2. Informações que coletamos",
    content:
      "Coletamos as seguintes informações fornecidas voluntariamente pelos usuários durante o cadastro e uso da plataforma:",
    items: [
      "Nome completo",
      "Endereço de e-mail",
      "Número de telefone / WhatsApp",
      "Dados de agendamento (serviços, horários, datas e histórico de atendimentos)",
      "Informações de perfil profissional (foto, descrição, endereço profissional, categorias de serviço)",
      "Chave Pix informada para recebimento de pagamentos",
      "Preferências visuais (cores, template, logo) selecionadas na personalização da página",
    ],
  },
  {
    title: "3. Como utilizamos seus dados",
    content:
      "Utilizamos os dados coletados para as seguintes finalidades:",
    items: [
      "Permitir o funcionamento da plataforma de agendamento online",
      "Exibir a página profissional do prestador de serviço com suas informações",
      "Viabilizar a comunicação entre profissional e cliente",
      "Enviar notificações e lembretes de agendamentos",
      "Melhorar a experiência do usuário e desenvolver novas funcionalidades",
      "Cumprir obrigações legais e regulatórias",
      "Prevenir fraudes e garantir a segurança da plataforma",
    ],
  },
  {
    title: "4. Consentimento",
    content:
      "O tratamento dos seus dados pessoais nesta plataforma é realizado, em sua maioria, com base no seu consentimento (art. 7º, I, da LGPD). Ao se cadastrar como profissional ou ao realizar um agendamento, você deve marcar a caixa de consentimento, que registra sua aceitação expressa dos Termos de Uso e desta Política de Privacidade.",
    items: [
      "O consentimento é coletado de forma livre, informada e inequívoca, por meio de ação afirmativa (caixa de seleção)",
      "A data e o horário da manifestação do consentimento são registrados em nossos sistemas para fins de comprovação (art. 8º, § 2º, da LGPD)",
      "Exibimos um aviso de consentimento ao acessar o site, permitindo escolher entre aceitar todos os cookies ou somente os essenciais",
      "Você pode revogar o consentimento a qualquer momento, com efeito a partir da revogação, conforme o item sobre direitos do titular",
    ],
    extra:
      "A revogação do consentimento não afeta a legalidade do tratamento realizado anteriormente, nem os dados que precisamos manter para cumprir obrigações legais.",
  },
  {
    title: "5. Compartilhamento com terceiros",
    content:
      "O AN.BR não vende dados pessoais. O compartilhamento de informações com terceiros ocorre apenas quando necessário para a prestação dos serviços, nas seguintes situações:",
    items: [
      "Processadores de pagamento (para viabilizar transações via Pix e demais meios)",
      "Serviços de hospedagem e infraestrutura em nuvem",
      "Ferramentas de análise e monitoramento para melhoria da plataforma",
      "Cumprimento de ordem judicial ou requisição de autoridade competente",
    ],
    extra:
      "Em todos os casos, exigimos que os terceiros contratados adotem medidas de segurança compatíveis com as exigências da LGPD.",
  },
  {
    title: "6. Direitos do titular (LGPD)",
    content:
      "Nos termos dos artigos 17 a 22 da Lei nº 13.709/2018, você possui os seguintes direitos em relação aos seus dados pessoais:",
    items: [
      "Confirmação e acesso: saber se tratamos seus dados e ter acesso a eles",
      "Correção: solicitar a retificação de dados incompletos, inexatos ou desatualizados",
      "Exclusão: solicitar a eliminação dos dados pessoais tratados com o seu consentimento",
      "Portabilidade: solicitar a transferência dos dados a outro fornecedor de serviço",
      "Oposição: opor-se ao tratamento de dados para finalidades específicas",
      "Informação: saber com quais entidades públicas ou privadas compartilhamos seus dados",
      "Revogação do consentimento: retirar seu consentimento a qualquer momento",
    ],
    extra:
      "Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail do encarregado de proteção de dados (DPO).",
  },
  {
    title: "7. Cookies e tecnologias similares",
    content:
      "Utilizamos cookies e tecnologias semelhantes para melhorar a experiência de navegação, analisar o uso da plataforma e garantir a segurança. Os cookies podem ser:",
    items: [
      "Essenciais: necessários para o funcionamento básico da plataforma",
      "Analíticos: utilizados para entender como os usuários interagem com o sistema",
      "Funcionais: permitem lembrar preferências e personalizações do usuário",
    ],
    extra:
      "Você pode gerenciar ou desabilitar os cookies nas configurações do seu navegador, mas isso pode afetar o funcionamento de algumas funcionalidades.",
  },
  {
    title: "8. Segurança e armazenamento dos dados",
    content:
      "Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou divulgação inadequada. Entre as medidas implementadas estão:",
    items: [
      "Criptografia em trânsito (TLS/SSL) e em repouso",
      "Controle de acesso restrito a servidores e bancos de dados",
      "Monitoramento contínuo de segurança",
      "Backups periódicos",
    ],
    extra:
      "Os dados são armazenados em servidores localizados no Brasil, salvo eventual necessidade de processamento em servidores no exterior, caso em que adotaremos garantias compatíveis com a legislação brasileira. O período de armazenamento é o necessário para cumprir as finalidades descritas nesta política ou para atender obrigações legais.",
  },
  {
    title: "9. Encarregado de proteção de dados (DPO)",
    content:
      "O AN.BR nomeou um Encarregado de Proteção de Dados (Data Protection Officer — DPO) para atuar como canal de comunicação com os titulares dos dados e com a Autoridade Nacional de Proteção de Dados (ANPD).",
    contact: true,
    extra:
      "Para qualquer questão relacionada à privacidade ou para exercer seus direitos, entre em contato:",
  },
  {
    title: "10. Alterações nesta política",
    content:
      "Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos a consulta regular desta página para se manter informado sobre eventuais mudanças. O AN.BR notificará os usuários sobre alterações relevantes por meio dos canais de comunicação disponíveis.",
  },
];

export default function PrivacidadePage() {
  return (
    <div className="bg-[var(--color-bg)]">
      <SiteNav />

      {/* Conteúdo */}
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Título */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              LGPD / Lei 13.709/2018
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Política de Privacidade
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
                {section.contact && (
                  <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
                    <p className="font-medium text-ink">DPO — Encarregado de Proteção de Dados</p>
                    <a
                      href="mailto:caridad@email.com"
                      className="mt-1 inline-flex items-center gap-1 text-[var(--color-primary)] underline underline-offset-2 hover:brightness-110"
                    >
                      caridad@email.com
                    </a>
                  </div>
                )}
                {section.extra && !section.contact && (
                  <p className="mt-3 text-ink-soft leading-relaxed">
                    {section.extra}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Foro */}
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6 text-center sm:p-8">
            <p className="text-sm text-ink-soft leading-relaxed">
              Esta política é regida pela legislação brasileira. Fica eleito o foro da
              Comarca de Curitiba, Estado do Paraná, para dirimir quaisquer controvérsias
              decorrentes desta política.
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

