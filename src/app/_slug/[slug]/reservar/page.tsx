import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { notFound } from "next/navigation";
import { ReservarClient } from "./ReservarClient";

export default async function ReservarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  return <ReservarClient config={config} />;
}
