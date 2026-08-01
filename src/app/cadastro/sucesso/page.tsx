import type { Metadata } from "next";
import SucessoContent from "./SucessoContent";

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { slug } = await searchParams;
  if (!slug) return {};
  return { manifest: `/${slug}/manifest.webmanifest` };
}

export default function SucessoPage() {
  return <SucessoContent />;
}
