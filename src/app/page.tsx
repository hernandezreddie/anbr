export default function HomePage() {
  return (
    <div className="container-x py-20 text-center">
      <h1 className="mb-6 text-4xl font-bold md:text-5xl">
        Seu sistema de agendamento profissional
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-lg text-ink-soft">
        Crie seu próprio sistema de agendamento online em 5 minutos.
        Landing page, agenda, Pix, WhatsApp — tudo incluído.
      </p>
      <a
        href="/cadastro"
        className="btn-emerald inline-flex items-center gap-2 px-8 py-4 text-lg"
      >
        Criar meu sistema agora
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
