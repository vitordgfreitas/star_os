"use client";

import type { Dispatch, SetStateAction } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import type { FiltrosOS, OrdenacaoOS } from "@/types";
import { FILTROS_PADRAO } from "@/lib/ordens-filtros";
import { toDateInputValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OsFiltersProps {
  filtros: FiltrosOS;
  onChange: Dispatch<SetStateAction<FiltrosOS>>;
  totalFiltrado: number;
  totalGeral: number;
}

const OPCOES_ORDENACAO: { value: OrdenacaoOS; label: string }[] = [
  { value: "data", label: "Data início" },
  { value: "alfabetica", label: "Nome (A–Z)" },
];

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value + "T12:00:00");
}

export function OsFilters({ filtros, onChange, totalFiltrado, totalGeral }: OsFiltersProps) {
  function update(partial: Partial<FiltrosOS>) {
    onChange((prev) => ({ ...prev, ...partial }));
  }

  function limparFiltros() {
    onChange({ ...FILTROS_PADRAO });
  }

  const temFiltros =
    filtros.busca ||
    filtros.dataInicio ||
    filtros.dataFim ||
    filtros.ordenacao !== "data";

  return (
    <Card className="no-print">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-slate-400">
            Exibindo <strong className="text-slate-200">{totalFiltrado}</strong> de{" "}
            {totalGeral} ordem{totalGeral !== 1 ? "ns" : ""}
          </p>
          {temFiltros && (
            <button
              type="button"
              onClick={limparFiltros}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium text-left"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
          <Input
            value={filtros.busca}
            onChange={(e) => update({ busca: e.target.value })}
            placeholder="Buscar por órgão, nº do contrato ou item..."
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              Ordenar por
            </Label>
            <div
              className="flex h-12 rounded-lg border border-[#2a2d3e] bg-[#0f1117] p-1"
              role="group"
              aria-label="Ordenar por"
            >
              {OPCOES_ORDENACAO.map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => update({ ordenacao: opcao.value })}
                  className={cn(
                    "flex-1 rounded-md px-2 text-sm font-medium transition-colors min-h-10",
                    filtros.ordenacao === opcao.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1d2e]"
                  )}
                  aria-pressed={filtros.ordenacao === opcao.value}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Evento a partir de</Label>
            <DatePicker
              value={parseDate(filtros.dataInicio)}
              onChange={(d) => update({ dataInicio: d ? toDateInputValue(d) : undefined })}
              placeholder="Data inicial"
            />
          </div>

          <div>
            <Label>Evento até</Label>
            <DatePicker
              value={parseDate(filtros.dataFim)}
              onChange={(d) => update({ dataFim: d ? toDateInputValue(d) : undefined })}
              placeholder="Data final"
              minDate={parseDate(filtros.dataInicio)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
