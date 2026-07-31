import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AN.BR | Sistema de Agendamento Online para Profissionais",
    template: "%s | AN.BR",
  },
  description: "Crie seu sistema de agendamento online grátis em 5 minutos. Página profissional, WhatsApp, Pix e Google Calendar. Sem programação, sem mensalidade.",
  keywords: ["sistema de agendamento", "agendamento online", "agenda online grátis", "sistema para profissionais", "agendamento whatsapp", "marcar horário online", "sistema para barbearia", "sistema para salão", "agenda digital", "booking Brasil"],
  authors: [{ name: "AN.BR" }],
  metadataBase: new URL("https://autonexabrasil.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AN.BR",
    title: "AN.BR | Sistema de Agendamento Online para Profissionais",
    description: "Crie seu sistema de agendamento online grátis em 5 minutos. Página profissional, WhatsApp, Pix e Google Calendar.",
    url: "https://autonexabrasil.com.br",
  },
  twitter: {
    card: "summary_large_image",
    title: "AN.BR | Agendamento Online",
    description: "Crie seu sistema de agendamento online grátis em 5 minutos.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: "/favicon.svg",
  verification: {
    google: "jTQ7QzNE1nU_sIR_jA4pMEq9VWz62CihHhNq0Z5wM-A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AN.BR",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Sistema de agendamento online para profissionais autônomos. Crie sua página profissional em 5 minutos com WhatsApp, Pix e Google Calendar.",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "BRL",
                lowPrice: "0",
                highPrice: "99",
                offerCount: "4",
              },
              author: {
                "@type": "Organization",
                name: "AN.BR",
              },
              url: "https://autonexabrasil.com.br",
              inLanguage: "pt-BR",
              areaServed: "BR",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Preciso saber programação para criar meu sistema de agendamento?",
                  acceptedAnswer: { "@type": "Answer", text: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar em menos de 5 minutos." },
                },
                {
                  "@type": "Question",
                  name: "Quanto custa um sistema de agendamento online?",
                  acceptedAnswer: { "@type": "Answer", text: "O AN.BR oferece plano gratuito sem custos. Planos premium a partir de R$ 49/mês para recursos avançados como Google Calendar, domínio próprio e AI Agent." },
                },
                {
                  "@type": "Question",
                  name: "Quais tipos de serviço funcionam no AN.BR?",
                  acceptedAnswer: { "@type": "Answer", text: "Qualquer serviço profissional: beleza, estética, saúde, limpeza, consultoria, aulas particulares, fotografia, eventos e muito mais." },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

