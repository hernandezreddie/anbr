import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect, notFound } from "next/navigation";
import { AgentConfigClient } from "./AgentConfigClient";
import { isAdminPlataforma } from "@/lib/auth-roles";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (!(await isAdminPlataforma())) {
    redirect("/");
  }

  const adminDb = createAdminClient();
  const { data: profissional } = await adminDb
    .from("profissionais")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profissional) notFound();

  const { data: agentConfig } = await adminDb
    .from("agent_configs")
    .select("*")
    .eq("profissional_id", profissional.id)
    .single();

  const { data: docs } = await adminDb
    .from("knowledge_docs")
    .select("id, filename, type, chunk_count, token_count, created_at")
    .eq("profissional_id", profissional.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="btn-ghost btn-sm">&larr; Admin</a>
            <span className="text-gray-300">/</span>
            <span className="font-serif text-lg font-semibold">AI Agent · {profissional.nome}</span>
          </div>
          <span className="text-xs text-gray-400">{slug}</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <AgentConfigClient
          profissional={profissional}
          config={agentConfig || null}
          docs={docs || []}
        />
      </div>
    </div>
  );
}
