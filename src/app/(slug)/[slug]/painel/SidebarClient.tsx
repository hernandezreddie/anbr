"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  LogOut,
  Home,
  ExternalLink,
} from "lucide-react";

const links = [
  { href: "", label: "Dashboard", icon: LayoutDashboard, mobIcon: Home },
  { href: "/calendario", label: "Calendário", icon: CalendarDays, mobIcon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users, mobIcon: Users },
  { href: "/qr", label: "Meu QR", icon: QrCode, mobIcon: QrCode },
];

export function SidebarClient({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/painel`;

  const isActive = (href: string) => pathname === base + href;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 flex h-screen flex-col border-r border-neutral-200 bg-white">
          <div className="flex items-center gap-3 border-b border-neutral-100 px-6 py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
              L
            </div>
            <span className="text-lg font-bold text-neutral-900">Livreta</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {links.map((link) => {
              const url = base + link.href;
              const active = pathname === url;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={url}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-neutral-100 p-4 space-y-1">
            <Link
              href={`/${slug}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800"
            >
              <ExternalLink size={18} />
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

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white lg:hidden safe-bottom">
        <div className="flex items-center justify-around py-2">
          {links.map((link) => {
            const url = base + link.href;
            const active = pathname === url;
            const Icon = link.mobIcon || link.icon;
            return (
              <Link
                key={link.href}
                href={url}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? "text-emerald-600"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
                    active ? "bg-emerald-50" : ""
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}