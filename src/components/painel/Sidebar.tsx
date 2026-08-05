"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "", label: "Dashboard", icon: "📊" },
  { href: "/agendamentos", label: "Agendamentos", icon: "📅" },
  { href: "/ads", label: "AI Ads", icon: "📢" },
  { href: "/perfil", label: "Meu Perfil", icon: "👤" },
];

export function Sidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/painel`;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen flex-col border border-line bg-paper shadow-sm">
        <div className="flex items-center gap-2 border-b border-line px-6 py-5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold">AN.BR</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((link) => {
            const url = base + link.href;
            const isActive = pathname === url;
            return (
              <Link
                key={link.href}
                href={url}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-ink-soft hover:bg-gray-50 hover:text-ink"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <span className="mr-2">←</span>
            Ver página pública
          </Button>
        </div>
      </div>
    </aside>
  );
}