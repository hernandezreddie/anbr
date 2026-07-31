"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "", label: "Dashboard", icon: "📊" },
  { href: "/agendamentos", label: "Agendamentos", icon: "📅" },
  { href: "/perfil", label: "Meu Perfil", icon: "👤" },
];

export function Sidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/painel`;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen flex-col border-r border-line bg-paper">
        <div className="flex items-center gap-2 border-b border-line px-6 py-5">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold">AN.BR</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
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
          <Link
            href={`/${slug}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-soft transition-all hover:bg-gray-50 hover:text-ink"
          >
            <span>←</span>
            Ver página pública
          </Link>
        </div>
      </div>
    </aside>
  );
}

