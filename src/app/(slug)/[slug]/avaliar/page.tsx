import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AvaliarClient } from "./AvaliarClient";

export const metadata: Metadata = { title: "Avaliação | Agendamento Online" };

export default async function AvaliarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t: token } = await searchParams;

  if (!token) notFound();

  const supabase = createAdminClient();

  const { data: ag } = await supabase
    .from("agendamentos")
    .select("id, profissional_id, cliente_nome, token_avaliacao, status")
    .eq("token_avaliacao", token)
    .single();

  if (!ag) return <ErroPagina slug={slug} mensagem="Link de avaliação inválido ou expirado." />;

  const { data: prof } = await supabase
    .from("profissionais")
    .select("slug, primeiro_nome")
    .eq("id", ag.profissional_id)
    .single();

  if (!prof || prof.slug !== slug) return <ErroPagina slug={slug} mensagem="Link de avaliação inválido ou expirado." />;

  const { data: jaAvaliou } = await supabase
    .from("avaliacoes")
    .select("id")
    .eq("token", token)
    .maybeSingle();

  return (
    <main className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <AvaliarClient
        slug={slug}
        token={token}
        nome={ag.cliente_nome || ""}
        profissional={prof.primeiro_nome || "o profissional"}
        jaAvaliou={!!jaAvaliou}
      />
    </main>
  );
}

function ErroPagina({ slug, mensagem }: { slug: string; mensagem: string }) {
  return (
    <main className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 text-center shadow-sm">
        <p className="text-3xl">🤔</p>
        <h1 className="mt-3 font-serif text-xl font-semibold text-ink">{mensagem}</h1>
        <a
          href={`/${slug}`}
          className="btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          Voltar para a página
        </a>
      </div>
    </main>
  );
}
