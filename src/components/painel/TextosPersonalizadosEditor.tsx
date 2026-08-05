"use client";

import { RotateCcw } from "lucide-react";
import { getCopyPadrao } from "@/lib/copys-padrao";

type Props = {
  valor?: Record<string, any> | null;
  onChange: (novo: Record<string, any>) => void;
  categoria?: string | null;
  variante?: number;
};

function Campo({
  rotulo,
  dica,
  placeholder,
  valor,
  aoMudar,
  textarea = false,
}: {
  rotulo: string;
  dica?: string;
  placeholder: string;
  valor: string;
  aoMudar: (v: string) => void;
  textarea?: boolean;
}) {
  const customizado = valor.trim() !== "";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-neutral-700">{rotulo}</label>
        {customizado && (
          <button
            type="button"
            onClick={() => aoMudar("")}
            title="Usar o texto padrão"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <RotateCcw size={11} />
            padrão
          </button>
        )}
      </div>
      {textarea ? (
        <textarea
          rows={2}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 ${
            customizado
              ? "border-teal-400 focus:border-teal-500 focus:ring-teal-100"
              : "border-neutral-200 focus:border-teal-500 focus:ring-teal-100"
          }`}
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 ${
            customizado
              ? "border-teal-400 focus:border-teal-500 focus:ring-teal-100"
              : "border-neutral-200 focus:border-teal-500 focus:ring-teal-100"
          }`}
        />
      )}
      {dica && <p className="mt-1 text-[11px] text-neutral-400">{dica}</p>}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{titulo}</p>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

export function TextosPersonalizadosEditor({ valor = {}, onChange, categoria, variante = 0 }: Props) {
  const padrao = getCopyPadrao(categoria, variante);
  const personalizado = valor ?? {};

  function atualizar(chave: string, novo: any) {
    const copia = { ...personalizado };
    if (novo === "" || novo === null || novo === undefined) {
      delete copia[chave];
    } else {
      copia[chave] = novo;
    }
    onChange(copia);
  }

  function atualizarLinhaTitulo(indice: number, texto: string) {
    const atual = Array.isArray(personalizado.hero_titulo) ? [...personalizado.hero_titulo] : [];
    while (atual.length < 2) atual.push("");
    atual[indice] = texto;
    atualizar("hero_titulo", atual);
  }

  function atualizarHook(indice: number, campo: "titulo" | "texto", texto: string) {
    const atual = Array.isArray(personalizado.confianca_hooks)
      ? personalizado.confianca_hooks.map((h: any) => ({ ...h }))
      : [];
    while (atual.length <= indice) atual.push({ titulo: "", texto: "" });
    atual[indice][campo] = texto;
    atualizar("confianca_hooks", atual);
  }

  function limparTudo() {
    onChange({});
  }

  const temPersonalizado = Object.keys(personalizado).length > 0;

  return (
    <div className="grid gap-3">
      <Grupo titulo="Topo da página (primeira tela)">
        <Campo
          rotulo="Título — 1ª linha"
          placeholder={padrao.hero_titulo[0] ?? ""}
          valor={personalizado.hero_titulo?.[0] ?? ""}
          aoMudar={(v) => atualizarLinhaTitulo(0, v)}
        />
        <Campo
          rotulo="Título — 2ª linha (destaque)"
          placeholder={padrao.hero_titulo[1] ?? ""}
          valor={personalizado.hero_titulo?.[1] ?? ""}
          aoMudar={(v) => atualizarLinhaTitulo(1, v)}
        />
        <Campo
          rotulo="Subtítulo"
          textarea
          placeholder={padrao.hero_sub}
          valor={personalizado.hero_sub ?? ""}
          aoMudar={(v) => atualizar("hero_sub", v)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            rotulo="Botão principal"
            placeholder={padrao.hero_cta1}
            valor={personalizado.hero_cta1 ?? ""}
            aoMudar={(v) => atualizar("hero_cta1", v)}
          />
          <Campo
            rotulo="Botão secundário"
            placeholder={padrao.hero_cta2}
            valor={personalizado.hero_cta2 ?? ""}
            aoMudar={(v) => atualizar("hero_cta2", v)}
          />
        </div>
      </Grupo>

      <Grupo titulo="Seção de confiança">
        <Campo
          rotulo="Selo (texto pequeno acima do título)"
          placeholder={padrao.confianca_eyebrow}
          valor={personalizado.confianca_eyebrow ?? ""}
          aoMudar={(v) => atualizar("confianca_eyebrow", v)}
        />
        <Campo
          rotulo="Título"
          placeholder={padrao.confianca_titulo}
          valor={personalizado.confianca_titulo ?? ""}
          aoMudar={(v) => atualizar("confianca_titulo", v)}
        />
        {[0, 1, 2].map((i) => {
          const hookPadrao = padrao.confianca_hooks?.[i];
          return (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <Campo
                rotulo={`Destaque ${i + 1} — título`}
                placeholder={hookPadrao?.titulo ?? ""}
                valor={personalizado.confianca_hooks?.[i]?.titulo ?? ""}
                aoMudar={(v) => atualizarHook(i, "titulo", v)}
              />
              <Campo
                rotulo={`Destaque ${i + 1} — texto`}
                placeholder={hookPadrao?.texto ?? ""}
                valor={personalizado.confianca_hooks?.[i]?.texto ?? ""}
                aoMudar={(v) => atualizarHook(i, "texto", v)}
              />
            </div>
          );
        })}
      </Grupo>

      <Grupo titulo="Seção de serviços">
        <Campo
          rotulo="Título"
          placeholder={padrao.servicos_titulo}
          valor={personalizado.servicos_titulo ?? ""}
          aoMudar={(v) => atualizar("servicos_titulo", v)}
        />
        <Campo
          rotulo="Subtítulo"
          textarea
          placeholder={padrao.servicos_sub}
          valor={personalizado.servicos_sub ?? ""}
          aoMudar={(v) => atualizar("servicos_sub", v)}
        />
      </Grupo>

      <Grupo titulo="Chamada final (antes do botão de agendar)">
        <Campo
          rotulo="Título"
          textarea
          placeholder={padrao.cta_titulo}
          valor={personalizado.cta_titulo ?? ""}
          aoMudar={(v) => atualizar("cta_titulo", v)}
        />
        <Campo
          rotulo="Subtítulo"
          textarea
          placeholder={padrao.cta_sub}
          valor={personalizado.cta_sub ?? ""}
          aoMudar={(v) => atualizar("cta_sub", v)}
        />
        <Campo
          rotulo="Texto do botão"
          placeholder={padrao.cta_btn}
          valor={personalizado.cta_btn ?? ""}
          aoMudar={(v) => atualizar("cta_btn", v)}
        />
      </Grupo>

      <Grupo titulo="Mensagem do WhatsApp">
        <Campo
          rotulo="Mensagem do botão de WhatsApp"
          textarea
          placeholder={padrao.whatsapp_msg}
          valor={personalizado.whatsapp_msg ?? ""}
          aoMudar={(v) => atualizar("whatsapp_msg", v)}
        />
      </Grupo>

      {temPersonalizado && (
        <button
          type="button"
          onClick={limparTudo}
          className="justify-self-start rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:border-red-200 hover:text-red-600"
        >
          Limpar todos os textos personalizados
        </button>
      )}
    </div>
  );
}
