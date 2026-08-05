import { describe, it, expect } from "vitest";
import { estimar } from "@/lib/precos";
import type { Servico, Adicional, Frequencia } from "@/types";

const servicoFixo: Servico = {
  id: "s1",
  profissional_id: "p1",
  nome: "Corte de Cabelo",
  descricao: "",
  descricao_curta: "",
  tipo_preco: "fixo",
  preco_fixo: 50,
  valor_hora: 0,
  duracao_minutos: 30,
  horas_base: 0,
  horas_minimas: 0,
  multiplicador: 1,
  horas_extras: 0,
  ativo: true,
  ordem: 1,
};

const servicoHora: Servico = {
  id: "s2",
  profissional_id: "p1",
  nome: "Limpeza Residencial",
  descricao: "",
  descricao_curta: "",
  tipo_preco: "por_hora",
  preco_fixo: 0,
  valor_hora: 80,
  duracao_minutos: 0,
  horas_base: 0,
  horas_minimas: 2,
  multiplicador: 1,
  horas_extras: 0,
  ativo: true,
  ordem: 2,
};

const adicional: Adicional = {
  id: "a1",
  profissional_id: "p1",
  servico_id: "s1",
  nome: "Janelas",
  descricao: "",
  preco: 30,
  horas: 0.5,
  ativo: true,
};

const freqSemanal: Frequencia = {
  id: "fw",
  profissional_id: "p1",
  nome: "Semanal",
  slug: "semanal",
  desconto: 10,
  ordem: 1,
};

describe("estimar()", () => {
  describe("preço fixo", () => {
    it("retorna o preço fixo + adicional", () => {
      const r = estimar({
        servico: servicoFixo,
        adicionais: [adicional],
        adicionaisSelecionados: ["a1"],
        frequencia: null,
      });

      expect(r.servico_nome).toBe("Corte de Cabelo");
      expect(r.bruto).toBe(80); // 50 + 30
      expect(r.horas).toBe(0);
      expect(r.total).toBe(80);
      expect(r.desconto).toBe(0);
      expect(r.duracao_minutos).toBe(30);
    });

    it("sem adicionais selecionados", () => {
      const r = estimar({
        servico: servicoFixo,
        adicionais: [],
        adicionaisSelecionados: [],
        frequencia: null,
      });

      expect(r.bruto).toBe(50);
      expect(r.total).toBe(50);
    });

    it("aplica desconto de frequência (10%)", () => {
      const r = estimar({
        servico: servicoFixo,
        frequencia: freqSemanal,
      });

      expect(r.total).toBe(45); // 50 - 10% = 45
      expect(r.descontoFrequencia).toBe(5);
    });

    it("aplica promoção de porcentagem", () => {
      const r = estimar({
        servico: servicoFixo,
        frequencia: null,
        promocao: { tipo: "porcentagem", valor: 20 },
      });

      expect(r.total).toBe(40); // 50 - 20% = 40
      expect(r.descontoPromo).toBe(10);
    });

    it("aplica promoção fixa", () => {
      const r = estimar({
        servico: servicoFixo,
        frequencia: null,
        promocao: { tipo: "fixo", valor: 15 },
      });

      expect(r.total).toBe(35); // 50 - 15 = 35
      expect(r.descontoPromo).toBe(15);
    });

    it("frequência + promoção combinados", () => {
      const r = estimar({
        servico: servicoFixo,
        frequencia: freqSemanal,
        promocao: { tipo: "fixo", valor: 10 },
      });

      // bruto 50, freq -5 (=45), promo fixa -10 → 35
      expect(r.total).toBe(35);
      expect(r.descontoFrequencia).toBe(5);
      expect(r.descontoPromo).toBe(10);
      expect(r.desconto).toBe(15);
    });

    it("promoção não pode gerar total negativo", () => {
      const r = estimar({
        servico: servicoFixo,
        frequencia: null,
        promocao: { tipo: "fixo", valor: 200 },
      });

      expect(r.total).toBe(0);
    });
  });

  describe("preço por hora", () => {
    it("calcula com base em horas e valor/hora", () => {
      const r = estimar({
        servico: servicoHora,
        horas_base: 3,
        frequencia: null,
      });

      expect(r.horas).toBe(3);
      expect(r.bruto).toBe(240); // 3 * 80
      expect(r.total).toBe(240);
    });

    it("respeita horas mínimas", () => {
      const r = estimar({
        servico: servicoHora,
        horas_base: 1,
        frequencia: null,
      });

      expect(r.horas).toBe(2); // mínimo é 2
      expect(r.bruto).toBe(160); // 2 * 80
    });

    it("soma horas de adicionais", () => {
      const r = estimar({
        servico: servicoHora,
        horas_base: 3,
        adicionais: [adicional],
        adicionaisSelecionados: ["a1"],
        frequencia: null,
      });

      expect(r.horas).toBe(3.5); // 3 + 0.5
      expect(r.bruto).toBe(270); // 3 * 80 + 30
    });

    it("frequência + promoção combinados", () => {
      const r = estimar({
        servico: servicoHora,
        horas_base: 4,
        frequencia: freqSemanal,
        promocao: { tipo: "porcentagem", valor: 25 },
      });

      // bruto = 4 * 80 = 320
      // freq 10% = 32 → 288
      // promo 25% sobre 288 = 72 → 216
      expect(r.bruto).toBe(320);
      expect(r.descontoFrequencia).toBe(32);
      expect(r.descontoPromo).toBe(72);
      expect(r.total).toBe(216);
    });
  });
});
