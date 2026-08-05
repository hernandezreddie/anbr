import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function supabaseProxy(opts: Record<string, unknown> = {}): Record<string, unknown> {
  return new Proxy(
    { then: undefined },
    {
      get(_t, prop) {
        const name = String(prop);
        if (name === "single") {
          const sd = opts.singleData ?? null;
          return () => Promise.resolve({ data: sd, error: opts.singleError ?? null });
        }
        if (name === "rpc") {
          const rd = opts.rpcData ?? null;
          return () => Promise.resolve({ data: rd, error: null });
        }
        if (name in opts) return opts[name];
        return () => supabaseProxy(opts);
      },
    }
  ) as any;
}

vi.mock("@/lib/rate-limit", () => ({
  rateLimitar: () => ({ permitido: true, emBreve: 0 }),
  ipDoRequest: () => "127.0.0.1",
}));

vi.mock("@/lib/planos", () => ({
  getPlanoAtivo: () => ({ limite_agendamentos: 999, plano: "pro" }),
  AGENDAMENTOS_GRATIS_POR_MES: 30,
}));

vi.mock("@/lib/precos", () => ({
  estimar: () => ({ total: 100, horas: 2, desconto: 0, duracao_minutos: 60, servico_nome: "Corte", bruto: 100, descontoFrequencia: 0, descontoPromo: 0 }),
}));

describe("POST /api/agendamentos — validações", () => {
  let callPost: (body: Record<string, unknown>) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock("@/lib/supabase/server", () => ({
      createClient: async () => supabaseProxy(),
    }));

    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => supabaseProxy(),
    }));

    const mod = await import("@/app/api/agendamentos/route");
    callPost = (body: Record<string, unknown>) =>
      mod.POST(new NextRequest("http://localhost/api/agendamentos", {
        method: "POST",
        body: JSON.stringify(body),
      }));
  });

  it("rejeita sem consentimento", async () => {
    const res = await callPost({ slug: "teste", servico_id: "s1", cliente_nome: "João", cliente_whatsapp: "41999990000", data: "2026-08-10", hora: "14:00", consentimento: false });
    expect(res.status).toBe(400);
  });

  it("rejeita sem nome", async () => {
    const res = await callPost({ slug: "teste", servico_id: "s1", cliente_whatsapp: "41999990000", data: "2026-08-10", hora: "14:00", consentimento: true });
    expect(res.status).toBe(400);
  });

  it("rejeita whatsapp inválido (letras)", async () => {
    const res = await callPost({ slug: "teste", servico_id: "s1", cliente_nome: "João", cliente_whatsapp: "abc123", data: "2026-08-10", hora: "14:00", consentimento: true });
    expect(res.status).toBe(400);
  });

  it("rejeita whatsapp curto (< 10 dígitos)", async () => {
    const res = await callPost({ slug: "teste", servico_id: "s1", cliente_nome: "João", cliente_whatsapp: "12345", data: "2026-08-10", hora: "14:00", consentimento: true });
    expect(res.status).toBe(400);
  });

  it("rejeita formato de hora inválido", async () => {
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => supabaseProxy({ singleData: { id: "p1", status: "ativo" } }),
    }));
    const mod = await import("@/app/api/agendamentos/route");
    const res = await mod.POST(new NextRequest("http://localhost/api/agendamentos", {
      method: "POST",
      body: JSON.stringify({ slug: "teste", servico_id: "s1", cliente_nome: "João", cliente_whatsapp: "41999990000", data: "2026-08-10", hora: "25:00", consentimento: true }),
    }));
    expect(res.status).toBe(400);
  });

  it("rejeita data no passado", async () => {
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => supabaseProxy({ singleData: { id: "p1", status: "ativo" } }),
    }));
    const mod = await import("@/app/api/agendamentos/route");
    const res = await mod.POST(new NextRequest("http://localhost/api/agendamentos", {
      method: "POST",
      body: JSON.stringify({ slug: "teste", servico_id: "s1", cliente_nome: "João", cliente_whatsapp: "41999990000", data: "2020-01-01", hora: "14:00", consentimento: true }),
    }));
    expect(res.status).toBe(400);
  });
});
