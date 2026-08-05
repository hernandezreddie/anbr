import { describe, it, expect } from "vitest";
import { mensagemReserva, linkWhatsApp } from "@/lib/whatsapp";

describe("mensagemReserva()", () => {
  it("gera mensagem completa com todos os campos", () => {
    const msg = mensagemReserva("Maria", {
      nome: "João Silva",
      servico: "Corte Feminino",
      adicionais: ["Hidratação", "Escova"],
      horas: 1.5,
      endereco: "Rua das Flores, 123",
      cep: "80000-000",
      data: "15/08/2026",
      hora: "14:00",
      frequencia: "Mensal",
      total: 120,
    });

    expect(msg).toContain("Olá Maria!");
    expect(msg).toContain("👤 João Silva");
    expect(msg).toContain("🧼 Corte Feminino");
    expect(msg).toContain("➕ Adicionais: Hidratação, Escova");
    expect(msg).toContain("⏱️ Duração estimada: 1.5h");
    expect(msg).toContain("📍 Rua das Flores, 123 (CEP 80000-000)");
    expect(msg).toContain("📅 15/08/2026 às 14:00");
    expect(msg).toContain("🔁 Frequência: Mensal");
    expect(msg).toContain("💰 Valor estimado: R$ 120,00");
  });

  it("omite campos opcionais ausentes", () => {
    const msg = mensagemReserva("Maria", {
      nome: "João",
      servico: "Corte",
      adicionais: [],
      horas: 0,
      frequencia: "Única",
      total: 50,
    });

    expect(msg).toContain("Olá Maria!");
    expect(msg).toContain("👤 João");
    expect(msg).not.toContain("➕");
    expect(msg).not.toContain("📍");
    expect(msg).not.toContain("📅");
    expect(msg).toContain("💰 Valor estimado: R$ 50,00");
  });

  it("mostra endereço sem CEP", () => {
    const msg = mensagemReserva("Maria", {
      nome: "João",
      servico: "Corte",
      adicionais: [],
      horas: 0,
      endereco: "Rua X",
      frequencia: "Única",
      total: 50,
    });

    expect(msg).toContain("📍 Rua X");
    expect(msg).not.toContain("CEP");
  });

  it("mostra data sem hora", () => {
    const msg = mensagemReserva("Maria", {
      nome: "João",
      servico: "Corte",
      adicionais: [],
      horas: 0,
      data: "15/08/2026",
      frequencia: "Única",
      total: 50,
    });

    expect(msg).toContain("📅 15/08/2026");
    expect(msg).not.toContain(" às ");
  });

  it("formata valor com vírgula", () => {
    const msg = mensagemReserva("Maria", {
      nome: "João",
      servico: "Corte",
      adicionais: [],
      horas: 0,
      frequencia: "Única",
      total: 99.9,
    });

    expect(msg).toContain("R$ 99,90");
  });
});

describe("linkWhatsApp()", () => {
  it("gera link com número limpo", () => {
    const link = linkWhatsApp("Olá", "+55 (41) 99999-0000");
    expect(link).toContain("wa.me/5541999990000");
    expect(link).toContain("text=Ol%C3%A1");
  });

  it("remove caracteres não numéricos", () => {
    const link = linkWhatsApp("Teste", "41 9 9999 9999");
    expect(link).toContain("wa.me/41999999999");
  });
});
