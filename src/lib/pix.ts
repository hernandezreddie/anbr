function tlv(id: string, valor: string) {
  const len = valor.length.toString().padStart(2, "0");
  return `${id}${len}${valor}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(txt: string, max: number) {
  return txt
    .normalize("NFD")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

export function gerarPixCopiaECola(params: {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  txid?: string;
  descricao?: string;
}) {
  const { chave, nome, cidade, valor, txid = "***", descricao } = params;

  const mai =
    tlv("00", "br.gov.bcb.pix") +
    tlv("01", chave) +
    (descricao ? tlv("02", sanitize(descricao, 40)) : "");

  const payloadSemCRC =
    tlv("00", "01") +
    tlv("01", valor ? "12" : "11") +
    tlv("26", mai) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (valor ? tlv("54", valor.toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", sanitize(nome, 25)) +
    tlv("60", sanitize(cidade, 15)) +
    tlv("62", tlv("05", sanitize(txid, 25) || "***")) +
    "6304";

  return payloadSemCRC + crc16(payloadSemCRC);
}