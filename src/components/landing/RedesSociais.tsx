import { MapPin } from "lucide-react";
import { accento } from "@/lib/cores";
import type { ProfissionalConfig } from "@/types";

function InstagramIcon({ size = 17, color }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 17, color }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function urlSegura(v: string | null | undefined): string | null {
  if (!v?.trim()) return null;
  const u = v.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function RedesSociais({ config }: { config: ProfissionalConfig }) {
  const { configuracao } = config;
  const primary = configuracao.cor_primaria || "#059669";
  const accent = accento(primary);

  const links = [
    { href: urlSegura(configuracao.instagram), label: "Instagram", Icon: InstagramIcon },
    { href: urlSegura(configuracao.facebook), label: "Facebook", Icon: FacebookIcon },
    { href: urlSegura(configuracao.google_maps), label: "Google Maps", Icon: MapPin },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-paper)] py-8">
      <div className="container-x flex flex-wrap items-center justify-center gap-3">
        {links.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: `${primary}30`, color: accent }}
          >
            <Icon size={17} color={accent} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
