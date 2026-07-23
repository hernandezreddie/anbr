export type BlocoOcupado = { data: string; inicio: string | null; horas: number };

export const JORNADA_INICIO = 8;
export const JORNADA_FIM = 19;

const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const isoLocal = (d: Date) => d.toLocaleDateString("sv-SE");

export function ocorrenciasRecorrentes(
  dataBase: string,
  recorrencia: string | null,
  horizonteDias = 120,
): string[] {
  if (!dataBase || !recorrencia || recorrencia === "pontual") return [];
  const base = new Date(dataBase + "T00:00:00");
  if (isNaN(base.getTime())) return [];
  const limite = new Date(base);
  limite.setDate(limite.getDate() + horizonteDias);

  const out: string[] = [];
  const d = new Date(base);
  for (let i = 0; i < 60; i++) {
    if (recorrencia === "mensal") d.setMonth(d.getMonth() + 1);
    else if (recorrencia === "quinzenal") d.setDate(d.getDate() + 14);
    else if (recorrencia === "semanal") d.setDate(d.getDate() + 7);
    else break;
    if (d > limite) break;
    out.push(isoLocal(d));
  }
  return out;
}

export function diaOcupado(dataSel: string, ocupado: BlocoOcupado[]): boolean {
  return !!dataSel && ocupado.some((o) => o.data === dataSel);
}

export function slotsDisponiveis(
  dataSel: string,
  horasServico: number,
  ocupado: BlocoOcupado[],
): string[] {
  if (!dataSel || diaOcupado(dataSel, ocupado)) return [];

  const dur = Math.max(1, horasServico) * 60;
  const janela = (JORNADA_FIM - JORNADA_INICIO) * 60;
  const durEncaixe = Math.min(dur, janela);

  const hojeISO = new Date().toLocaleDateString("sv-SE");
  const agoraMin =
    dataSel === hojeISO ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  const slots: string[] = [];
  for (let ini = JORNADA_INICIO * 60; ini + durEncaixe <= JORNADA_FIM * 60; ini += 60) {
    if (ini <= agoraMin) continue;
    slots.push(toHHMM(ini));
  }
  return slots;
}
