"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SucessoContent() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="container-x py-20 text-center">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-6xl">🎉</div>
        <h1 className="mb-4 text-3xl font-semibold">Sistema criado com sucesso!</h1>
        <p className="mb-8 text-lg text-ink-soft">
          Seu sistema de agendamento já está disponível.
        </p>
        {slug && origin && (
          <a
            href={`${origin}/${slug}`}
            className="mb-4 block text-lg font-semibold text-emerald-600 underline"
          >
            {origin}/{slug}
          </a>
        )}
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  );
}
