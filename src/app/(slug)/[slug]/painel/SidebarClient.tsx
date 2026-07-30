"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ListTodo, User, Users, QrCode, LogOut } from "lucide-react";

const links = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/agendamentos", label: "Agendamentos", icon: ListTodo },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/qr", label: "Meu QR", icon: QrCode },
  { href: "/perfil", label: "Meu Perfil", icon: User },
];

export function SidebarClient({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/painel`;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen flex-col border-r border-line bg-paper">
        <div className="flex items-center gap-2 border-b border-line px-6 py-5">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold">Livreta</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const url = base + link.href;
            const isActive = pathname === url;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={url}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-ink-soft hover:bg-gray-50 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4 space-y-1">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-soft transition-all hover:bg-gray-50 hover:text-ink"
          >
            <span>←</span>
            Ver página pública
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50">
              <LogOut size={18} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
