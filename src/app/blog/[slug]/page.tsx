import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "@/lib/blog/posts";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | Blog AN.BR`,
    description: post.description,
    alternates: { canonical: url },
    keywords: ["agendamento online", "profissional autônomo", post.category, post.title.split(":")[0]],
    openGraph: {
      title: `${post.title} | Blog AN.BR`,
      description: post.description,
      url,
      type: "article",
      siteName: "AN.BR",
      locale: "pt_BR",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Blog AN.BR`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "AN.BR",
      url: SITE_URL,
    },
    articleSection: post.category,
    keywords: ["agendamento online", "profissional autônomo", post.category],
  };

  return (
    <div className="bg-[var(--color-bg)]">
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <div className="container-x py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para o blog
            </Link>

            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                <Tag size={12} />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
                <CalendarDays size={14} />
                {new Date(post.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-ink-soft leading-relaxed">
              {post.description}
            </p>

            <div className="mt-10">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-ink prose-headings:font-bold
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-ink prose-p:leading-relaxed prose-p:mb-4
                  prose-strong:text-ink prose-strong:font-semibold
                  prose-ul:my-4 prose-ul:space-y-2
                  prose-li:text-ink prose-li:leading-relaxed
                  prose-em:text-ink-soft"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>
      </article>

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

      <section className="py-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <h3 className="font-serif text-xl font-bold text-ink mb-6">Artigos relacionados</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {posts
                .filter((p) => p.slug !== post.slug && p.category === post.category)
                .slice(0, 2)
                .map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="card p-5 transition-all hover:shadow-md hover:border-[var(--color-primary)]/20"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)] mb-2">
                      {rel.category}
                    </span>
                    <h4 className="font-serif font-bold text-ink text-sm leading-snug">
                      {rel.title}
                    </h4>
                    <p className="mt-1 text-xs text-ink-soft line-clamp-2">{rel.description}</p>
                  </Link>
                ))}
            </div>
          </div>
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
