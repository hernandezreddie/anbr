"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  Users,
  MoreHorizontal,
  Settings,
  QrCode,
  Bot,
  CreditCard,
  ExternalLink,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

const principais = [
  { href: "", label: "Início", icon: LayoutDashboard },
  { href: "/agendamentos", label: "Agenda", icon: ListOrdered },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
];

const extras = [
  { href: "/perfil", label: "Perfil", icon: Settings },
  { href: "/qr", label: "Meu QR", icon: QrCode },
  { href: "/agente", label: "AI Agent", icon: Bot },
  { href: "/plano", label: "Meu Plano", icon: CreditCard },
  { href: "?guia=1", label: "Como usar", icon: Sparkles },
];

export function SidebarClient({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/${slug}/painel`;
  const [primary, setPrimary] = useState("#059669");
  const [maisAberto, setMaisAberto] = useState(false);
  const maisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient()
      .from("configuracoes")
      .select("cor_primaria")
      .single()
      .then(({ data }) => {
        if (data?.cor_primaria) setPrimary(data.cor_primaria);
      });
  }, []);

  useEffect(() => {
    setMaisAberto(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (maisRef.current && !maisRef.current.contains(e.target as Node)) {
        setMaisAberto(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => pathname === base + href;

  return (
    <>
      {/* TOP BAR — brand on every size */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href={base} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Logo className="h-7 w-7" />
            </span>
            <span className="text-sm font-bold text-neutral-900">
              AN<span className="text-neutral-400">.</span>BR
            </span>
          </Link>
          <Link
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-800 sm:flex"
          >
            <ExternalLink size={14} />
            Ver página pública
          </Link>
          <button
            onClick={() => setMaisAberto((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-800 sm:hidden"
          >
            <MoreHorizontal size={16} />
            Menu
          </button>
        </div>
      </header>

      {/* MAIN BOTTOM NAV — 4 core tabs + Mais */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {principais.map((link) => {
            const url = base + link.href;
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={url}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-all ${
                  active ? "" : "text-neutral-400 hover:text-neutral-600"
                }`}
                style={active ? { color: primary } : {}}
              >
                <div
                  className="flex items-center justify-center rounded-xl px-4 py-1.5 transition-all"
                  style={active ? { backgroundColor: `${primary}12` } : {}}
                >
                  <Icon size={22} />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Mais dropdown */}
          <div className="relative" ref={maisRef}>
            <button
              onClick={() => setMaisAberto((v) => !v)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-all ${
                extras.some((e) => isActive(e.href)) ? "" : "text-neutral-400 hover:text-neutral-600"
              }`}
              style={extras.some((e) => isActive(e.href)) ? { color: primary } : {}}
            >
              <div
                className="flex items-center justify-center rounded-xl px-4 py-1.5 transition-all"
                style={
                  extras.some((e) => isActive(e.href))
                    ? { backgroundColor: `${primary}12` }
                    : {}
                }
              >
                <MoreHorizontal size={22} />
              </div>
              <span>Mais</span>
            </button>

            <AnimatePresence>
              {maisAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMaisAberto(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-0 z-50 mb-3 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                  >
                    <div className="p-2">
                      {extras.map((link) => {
                        const url = base + link.href;
                        const active = isActive(link.href);
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={url}
                            onClick={() => setMaisAberto(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                              active
                                ? ""
                                : "text-neutral-600 hover:bg-neutral-50"
                            }`}
                            style={active ? { color: primary, backgroundColor: `${primary}12` } : {}}
                          >
                            <Icon size={18} />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-neutral-100 p-2">
                      <Link
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMaisAberto(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 sm:hidden"
                      >
                        <ExternalLink size={18} />
                        Ver página pública
                      </Link>
                      <form action="/auth/signout" method="post">
                        <button
                          type="submit"
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
                        >
                          <LogOut size={18} />
                          Sair
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  );
}
