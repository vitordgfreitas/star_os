import type { FiltrosOS, OrdemServico } from "@/types";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Converte data_inicio_evento em timestamp para comparação confiável */
function dataInicioMs(valor?: string | null): number {
  if (!valor) return 0;
  const apenasData = String(valor).split("T")[0];
  const ms = Date.parse(`${apenasData}T12:00:00`);
  return Number.isNaN(ms) ? 0 : ms;
}

/** Busca inteligente: nome do contrato, órgão ou nome de qualquer item */
function correspondeBusca(os: OrdemServico, termo: string): boolean {
  if (!termo.trim()) return true;

  const q = normalizar(termo.trim());
  const campos = [
    os.nome_contrato,
    os.orgao_publico,
    ...(os.itens_os?.map((i) => i.nome_item) ?? []),
  ];

  return campos.some((c) => normalizar(c).includes(q));
}

/** OS cujo evento intersecta o período [inicio, fim] */
function correspondePeriodo(
  os: OrdemServico,
  dataInicio?: string,
  dataFim?: string
): boolean {
  if (!dataInicio && !dataFim) return true;

  const osInicio = os.data_inicio_evento;
  const osFim = os.data_fim_evento;

  if (dataInicio && osFim < dataInicio) return false;
  if (dataFim && osInicio > dataFim) return false;
  return true;
}

export function filtrarEOrdenarOrdens(
  ordens: OrdemServico[],
  filtros: FiltrosOS
): OrdemServico[] {
  const resultado = ordens.filter(
    (os) =>
      correspondeBusca(os, filtros.busca) &&
      correspondePeriodo(os, filtros.dataInicio, filtros.dataFim)
  );

  const ordenacao = filtros.ordenacao ?? "data";

  return [...resultado].sort((a, b) => {
    if (ordenacao === "alfabetica") {
      const nomeA = normalizar(a.nome_contrato || a.orgao_publico || "");
      const nomeB = normalizar(b.nome_contrato || b.orgao_publico || "");
      const cmp = nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "base" });
      if (cmp !== 0) return cmp;
      return dataInicioMs(a.data_inicio_evento) - dataInicioMs(b.data_inicio_evento);
    }

    // Por data de início do evento: mais antiga → mais recente
    const cmp = dataInicioMs(a.data_inicio_evento) - dataInicioMs(b.data_inicio_evento);
    if (cmp !== 0) return cmp;
    return a.id.localeCompare(b.id);
  });
}

export const FILTROS_PADRAO: FiltrosOS = {
  busca: "",
  ordenacao: "data",
};
