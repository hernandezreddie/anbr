import type { SupabaseClient } from "@supabase/supabase-js";

// UUID con fallback para contextos no seguros (http/LAN),
// donde crypto.randomUUID() no existe y el botón "no hacía nada".
export function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Resuelve el profissional_id del usuario logueado (profiles RLS self-select).
// Necesario porque los INSERT de agendamentos requieren profesional_id (RLS tenant).
export async function getMeuProfissionalId(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("profissional_id")
      .eq("id", user.id)
      .maybeSingle();
    return data?.profissional_id ?? null;
  } catch {
    return null;
  }
}
