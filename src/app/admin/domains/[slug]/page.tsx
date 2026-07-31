import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { DomainClient } from "./DomainClient"

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const adminDb = createAdminClient()

  const { data: prof } = await adminDb
    .from("profissionais")
    .select("id, nome, slug")
    .eq("slug", slug)
    .single()

  if (!prof) redirect("/admin")

  const { data: domain } = await adminDb
    .from("custom_domains")
    .select("*")
    .eq("profissional_id", prof.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/admin" className="btn-ghost btn-sm">← Admin</a>
            <span className="font-serif text-lg font-semibold">Domínio · {prof.nome}</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <DomainClient profissional={prof} domain={domain} />
      </div>
    </div>
  )
}
