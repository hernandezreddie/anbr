import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const profissionalId = formData.get("profissional_id") as string;
  const destino = (formData.get("destino") as string) || "logo";

  if (!file || !profissionalId) {
    return Response.json({ error: "Arquivo e profissional_id obrigatórios" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "png";
  const fileName = `${profissionalId}/${destino}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from("logos")
    .getPublicUrl(fileName);

  if (destino === "fundo") {
    await supabase
      .from("configuracoes")
      .update({ foto_fundo: publicUrl.publicUrl })
      .eq("profissional_id", profissionalId);
  } else {
    await supabase
      .from("configuracoes")
      .update({ logo_url: publicUrl.publicUrl })
      .eq("profissional_id", profissionalId);
  }

  return Response.json({ url: publicUrl.publicUrl });
}
