"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/#categorias", label: "Serviços" },
  { href: "/#funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteNav() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();

  const ativo = (href: string) => {
    if (href === "/precos") return pathname.startsWith("/precos");
    if (href === "/blog") return pathname.startsWith("/blog");
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/50 bg-[var(--color-bg)]/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Logo className="h-8 w-8" />
          </span>
          <span className="font-serif text-xl">AN.BR</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors hover:text-ink ${
                ativo(l.href) ? "font-medium text-[var(--color-primary)]" : "text-ink-soft"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/entrar" className="btn-ghost btn-sm text-ink">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary text-sm px-5 py-2.5">
            Criar meu sistema
          </Link>
        </nav>
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="p-2 text-ink sm:hidden"
          aria-label="Menu"
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenu && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-6 pb-6 pt-4 sm:hidden space-y-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileMenu(false)}
              className={`block w-full text-left text-sm py-2 ${
                ativo(l.href) ? "font-medium text-[var(--color-primary)]" : "text-ink-soft"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/entrar"
            onClick={() => setMobileMenu(false)}
            className="block w-full text-left text-sm py-2 font-medium text-teal-700"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setMobileMenu(false)}
            className="btn-primary w-full justify-center text-sm py-3"
          >
            Criar meu sistema
          </Link>
        </div>
      )}
    </header>
  );
}
