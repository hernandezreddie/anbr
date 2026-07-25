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

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
