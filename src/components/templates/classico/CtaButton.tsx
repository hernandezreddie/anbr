export default function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
    >
      {label}
      <span aria-hidden="true">→</span>
    </a>
  );
}
