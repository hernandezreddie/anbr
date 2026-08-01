"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Wallet, LogOut, ArrowLeft, Users, Settings } from "lucide-react";

export function AdminBottomNav() {
  const pathname = usePathname();
  const isDetail = pathname !== "/admin";

  const itens = isDetail
    ? [
        { href: "/admin", label: "Início", icon: LayoutDashboard },
        { href: "/admin/tenant", label: "Tenants", icon: Users, disabled: true },
      ]
    : [
        { href: "#novo-tenant", label: "Novo", icon: Plus },
        { href: "#assinaturas", label: "Pix", icon: Wallet },
        { href: "/admin", label: "Início", icon: LayoutDashboard },
        { href: "/admin/tenant", label: "Tenants", icon: Users, disabled: true },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-6xl items-center justify-around">
        {isDetail && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium text-neutral-500 transition-all hover:text-neutral-800 sm:text-[11px]"
          >
            <div className="flex items-center justify-center rounded-xl px-3 py-1.5 transition-all">
              <ArrowLeft size={22} />
            </div>
            <span>Voltar</span>
          </Link>
        )}

        {itens.map((item) => {
          if (item.disabled) return null;
          const Icon = item.icon;
          const isHash = item.href.startsWith("#");
          const classe =
            "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-all sm:text-[11px]";
          if (isHash) {
            return (
              <a key={item.href} href={item.href} className={`${classe} text-teal-700`}>
                <div className="flex items-center justify-center rounded-xl px-3 py-1.5 transition-all bg-teal-50">
                  <Icon size={22} />
                </div>
                <span>{item.label}</span>
              </a>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={`${classe} text-neutral-500 hover:text-neutral-800`}>
              <div className="flex items-center justify-center rounded-xl px-3 py-1.5 transition-all">
                <Icon size={22} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium text-neutral-500 transition-all hover:text-red-600 sm:text-[11px]"
          >
            <div className="flex items-center justify-center rounded-xl px-3 py-1.5 transition-all">
              <LogOut size={22} />
            </div>
            <span>Sair</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
