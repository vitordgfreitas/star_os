"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItensOsList } from "@/components/os/ItensOsList";
import { OsDetalheDialog } from "@/components/os/OsDetalheDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { listarOrdensServico } from "@/lib/supabase/ordens-servico";
import type { OrdemServico, StatusItem } from "@/types";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TipoDia = "inicio" | "fim" | "inicio_fim";

interface OsNoDia {
  os: OrdemServico;
  tipos: TipoDia[];
}

function classificarOsNoDia(os: OrdemServico, diaStr: string): TipoDia | null {
  const inicio = os.data_inicio_evento.split("T")[0];
  const fim = os.data_fim_evento.split("T")[0];
  if (inicio === diaStr && fim === diaStr) return "inicio_fim";
  if (inicio === diaStr) return "inicio";
  if (fim === diaStr) return "fim";
  return null;
}

function agruparPorDia(ordens: OrdemServico[], dias: Date[]): Map<string, OsNoDia[]> {
  const mapa = new Map<string, OsNoDia[]>();

  for (const dia of dias) {
    const diaStr = toDateInputValue(dia);
    const lista: OsNoDia[] = [];

    for (const os of ordens) {
      const tipo = classificarOsNoDia(os, diaStr);
      if (tipo) lista.push({ os, tipos: [tipo] });
    }

    lista.sort(
      (a, b) =>
        (a.os.contratos?.numero_controle || a.os.nome_contrato).localeCompare(
          b.os.contratos?.numero_controle || b.os.nome_contrato,
          "pt-BR"
        )
    );

    mapa.set(diaStr, lista);
  }

  return mapa;
}

export function ListaServicosPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOs, setSelectedOs] = useState<OrdemServico | null>(null);
  const [semanaInicio, setSemanaInicio] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const diasSemana = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i)),
    [semanaInicio]
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setOrdens(await listarOrdensServico());
    } catch (err) {
      toast.error("Erro ao carregar serviços", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const porDia = useMemo(() => agruparPorDia(ordens, diasSemana), [ordens, diasSemana]);

  const rotuloSemana = `${format(diasSemana[0], "d MMM", { locale: ptBR })} — ${format(
    diasSemana[6],
    "d MMM yyyy",
    { locale: ptBR }
  )}`;

  function handleItemStatusChange(itemId: string, status: StatusItem) {
    setOrdens((prev) =>
      prev.map((o) =>
        o.id === selectedOs?.id
          ? {
              ...o,
              itens_os: o.itens_os?.map((i) =>
                i.id === itemId ? { ...i, status_item: status } : i
              ),
            }
          : o
      )
    );
    setSelectedOs((prev) =>
      prev
        ? {
            ...prev,
            itens_os: prev.itens_os?.map((i) =>
              i.id === itemId ? { ...i, status_item: status } : i
            ),
          }
        : null
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-slate-400">Carregando lista de serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de Serviços"
        description="Toque em um serviço para ver detalhes e atualizar status dos itens."
      />
      <SubNav />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 no-print">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSemanaInicio((d) => addDays(d, -7))}
          className="min-h-14 text-base gap-2"
        >
          <ChevronLeft className="h-6 w-6" />
          Semana Anterior
        </Button>
        <p className="text-center text-lg font-semibold text-slate-200 capitalize">{rotuloSemana}</p>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSemanaInicio((d) => addDays(d, 7))}
          className="min-h-14 text-base gap-2"
        >
          Próxima Semana
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {diasSemana.map((dia) => {
          const diaStr = toDateInputValue(dia);
          const servicos = porDia.get(diaStr) ?? [];
          const hoje = toDateInputValue(new Date()) === diaStr;

          return (
            <Card
              key={diaStr}
              className={cn(hoje && "border-indigo-500/50 ring-1 ring-indigo-500/20")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg capitalize flex items-center justify-between gap-2">
                  <span>
                    {format(dia, "EEEE", { locale: ptBR })}
                    <span className="text-slate-400 font-normal ml-2">{formatDate(diaStr)}</span>
                  </span>
                  {hoje && (
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-300 bg-indigo-600/20 px-2 py-1 rounded-lg">
                      Hoje
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {servicos.length === 0 ? (
                  <p className="text-slate-500 text-base py-4 text-center">Nenhum serviço neste dia.</p>
                ) : (
                  servicos.map(({ os, tipos }) => (
                    <div
                      key={os.id}
                      className="rounded-xl border border-[#2a2d3e] bg-[#0f1117] print:bg-white print:border-gray-300 print:break-inside-avoid"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedOs(os)}
                        className="w-full text-left p-4 space-y-2 hover:border-indigo-500/40 hover:bg-[#13151f] transition-colors min-h-[4.5rem] active:scale-[0.99] print:hidden"
                      >
                        <div className="flex flex-wrap gap-2">
                          {(tipos.includes("inicio") || tipos.includes("inicio_fim")) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
                              INÍCIO
                            </span>
                          )}
                          {(tipos.includes("fim") || tipos.includes("inicio_fim")) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-red-950/60 text-red-300 border border-red-700/50">
                              ENCERRA
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-slate-100">
                          {os.contratos?.numero_controle || os.nome_contrato}
                        </p>
                        <p className="text-sm text-slate-400">{os.orgao_publico}</p>
                        <p className="text-sm text-slate-500">
                          {os.cidade}/{os.estado} — {os.endereco}
                        </p>
                        <p className="text-sm text-indigo-400">{os.empresa_contratada}</p>
                      </button>

                      <div className="hidden print:block p-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {(tipos.includes("inicio") || tipos.includes("inicio_fim")) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-400 text-xs font-bold">
                              INÍCIO
                            </span>
                          )}
                          {(tipos.includes("fim") || tipos.includes("inicio_fim")) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-400 text-xs font-bold">
                              ENCERRA
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold">
                            {os.contratos?.numero_controle || os.nome_contrato}
                          </p>
                          <p className="text-sm">{os.orgao_publico}</p>
                          <p className="text-sm">
                            {os.cidade}/{os.estado} — {os.endereco}
                          </p>
                          <p className="text-sm font-medium">{os.empresa_contratada}</p>
                          <p className="text-sm mt-1">
                            {formatDate(os.data_inicio_evento)} até {formatDate(os.data_fim_evento)} —{" "}
                            {formatCurrency(os.valor_total)}
                          </p>
                        </div>

                        {os.observacoes && (
                          <div className="border border-gray-300 rounded p-3">
                            <p className="text-sm font-semibold mb-1">Observações</p>
                            <p className="text-sm whitespace-pre-wrap">{os.observacoes}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-semibold mb-2">Itens — Status Logístico</p>
                          <ItensOsList itens={os.itens_os ?? []} compact />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <OsDetalheDialog
        os={selectedOs}
        onClose={() => setSelectedOs(null)}
        onItemStatusChange={handleItemStatusChange}
      />
    </div>
  );
}
