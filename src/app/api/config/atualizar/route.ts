import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  const { profissional_id, ...updates } = await request.json();

  if (!profissional_id) {
    return Response.json({ error: "profissional_id obrigatório" }, { status: 400 });
  }

  const { error } = await supabase
    .from("configuracoes")
    .update(updates)
    .eq("profissional_id", profissional_id);

  if (error?.code === "PGRST204") {
    const { copy_variante, msg_variante, ...rest } = updates as any;
    if (copy_variante !== undefined || msg_variante !== undefined) {
      const { error: e2 } = await supabase
        .from("configuracoes")
        .update(rest)
        .eq("profissional_id", profissional_id);
      if (e2) return Response.json({ error: e2.message }, { status: 500 });
      return Response.json({ success: true, copy_variante_ignorado: true });
    }
  }

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
