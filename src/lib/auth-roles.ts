import { createClient } from "@/lib/supabase/server";

export type RolePerfil = "plataforma" | "admin" | "owner" | null;

// Roles com acesso à área de administração da plataforma.
// "admin" é criado manualmente para o dono da plataforma.
// "owner" pertence ao dono de cada tenant (cliente) — NÃO tem acesso ao /admin.
const ROLES_PLATAFORMA = ["plataforma", "admin"];

export async function getRoleUsuario(): Promise<RolePerfil> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as RolePerfil) || null;
}

/**
 * Usuário da plataforma (dono/admin). NÃO inclui "owner" de tenant.
 */
export async function isAdminPlataforma(): Promise<boolean> {
  const role = await getRoleUsuario();
  return ROLES_PLATAFORMA.includes(role || "");
}

/**
 * Verifica se o usuário logado pode acessar os dados do profissional:
 * - admins da plataforma: qualquer profissional
 * - owners: apenas o próprio tenant
 */
export async function verificarAcessoProfissional(
  profissionalId: string
): Promise<{ permitido: boolean; role: RolePerfil }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { permitido: false, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, profissional_id")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as RolePerfil) || null;

  if (ROLES_PLATAFORMA.includes(role || "")) {
    return { permitido: true, role };
  }

  if (role === "owner" && profile?.profissional_id === profissionalId) {
    return { permitido: true, role };
  }

  return { permitido: false, role };
}
