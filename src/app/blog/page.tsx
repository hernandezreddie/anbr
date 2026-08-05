import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog/posts";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";

export const metadata: Metadata = {
  title: "Blog | AN.BR — Dicas para Profissionais Autônomos",
  description:
    "Artigos sobre agendamento online, redução de faltas, marketing digital e tecnologia para profissionais autônomos.",
  alternates: { canonical: "https://autonexabrasil.com.br/blog" },
  openGraph: {
    title: "Blog | AN.BR",
    description:
      "Artigos sobre agendamento online, redução de faltas, marketing digital e tecnologia para autônomos.",
    url: "https://autonexabrasil.com.br/blog",
    siteName: "AN.BR",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | AN.BR",
    description:
      "Artigos sobre agendamento online, redução de faltas, marketing digital e tecnologia para autônomos.",
  },
};

export default function BlogIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog AN.BR",
    url: "https://autonexabrasil.com.br/blog",
    inLanguage: "pt-BR",
    description:
      "Artigos sobre agendamento online, redução de faltas, marketing digital e tecnologia para profissionais autônomos.",
    publisher: {
      "@type": "Organization",
      name: "AN.BR",
      url: "https://autonexabrasil.com.br",
    },
  };

  return (
    <div className="bg-[var(--color-bg)]">
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              Blog
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Dicas para <span className="text-[var(--color-primary)]">profissionais autônomos</span>
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              Artigos sobre agendamento online, gestão, marketing e tecnologia para ajudar você a crescer.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card overflow-hidden transition-all hover:shadow-md hover:border-[var(--color-primary)]/20 group flex flex-col"
              >
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                      <Tag size={12} />
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
                      <CalendarDays size={12} />
                      {new Date(post.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-ink leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                    {post.description}
                  </p>
                </div>
                <div className="px-6 pb-5">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
                    Ler artigo <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-16">
        <div className="container-x text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Quer testar o AN.BR gratuitamente?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Crie seu sistema de agendamento online em menos de 5 minutos. Sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-white/90 shadow-lg"
          >
            Criar meu sistema agora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-bold">A</span>
              <span className="font-serif text-base font-semibold">AN.BR</span>
            </div>
            <nav className="flex gap-6 text-sm text-ink-soft">
              <Link href="/" className="hover:text-ink transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
              <Link href="/cadastro" className="hover:text-ink transition-colors">Criar Sistema</Link>
            </nav>
            <p className="text-sm text-ink-soft">
              &copy; {new Date().getFullYear()} AN.BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

