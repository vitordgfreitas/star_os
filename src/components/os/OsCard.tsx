"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkIconButton } from "@/components/ui/link-icon-button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ItensOsList } from "@/components/os/ItensOsList";
import type { OrdemServico, StatusItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OsCardProps {
  os: OrdemServico;
  onEdit: (os: OrdemServico) => void;
  onDelete: (os: OrdemServico) => void;
  onToggleFinanceiro: (
    os: OrdemServico,
    campo: "nota_emitida" | "pagamento_recebido",
    valor: boolean
  ) => void;
  onItemStatusChange: (osId: string, itemId: string, status: StatusItem) => void;
}

export function OsCard({
  os,
  onEdit,
  onDelete,
  onToggleFinanceiro,
  onItemStatusChange,
}: OsCardProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Card className="overflow-hidden hover:border-indigo-500/20 transition-colors duration-200 print:hover:border-gray-300">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="no-print flex-shrink-0 mt-1 p-2 rounded-lg hover:bg-[#1a1d2e] text-slate-400 hover:text-indigo-300 transition-colors min-h-11 min-w-11 flex items-center justify-center"
            aria-expanded={expandido}
            aria-label={expandido ? "Recolher detalhes" : "Expandir detalhes"}
          >
            <ChevronDown
              className={cn("h-5 w-5 transition-transform duration-200", expandido && "rotate-180")}
            />
          </button>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 truncate print:text-black">
                {os.contratos?.numero_controle || os.nome_contrato}
              </h2>
              <StatusBadge status={os.status} />
              {os.link_drive_os && (
                <LinkIconButton
                  href={os.link_drive_os}
                  label="Abrir Ordem de Serviço no Drive"
                  className="h-8 w-8 no-print"
                />
              )}
            </div>
            <p className="text-sm text-slate-400 print:text-gray-700">{os.orgao_publico}</p>
            <p className="text-sm font-medium text-indigo-400 print:text-black">{os.empresa_contratada}</p>
            <p className="text-sm text-slate-500 print:text-gray-600">
              {os.cidade}/{os.estado} — {os.endereco}
            </p>
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 text-sm text-slate-500 print:text-gray-600">
              <span>
                <strong className="text-slate-400 print:text-black">Evento:</strong>{" "}
                {formatDate(os.data_inicio_evento)} até {formatDate(os.data_fim_evento)}
              </span>
              <span>
                <strong className="text-slate-400 print:text-black">Valor:</strong>{" "}
                {formatCurrency(os.valor_total)}
              </span>
              <span>
                <strong className="text-slate-400 print:text-black">Itens:</strong>{" "}
                {os.itens_os?.length ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(os)}
            className="w-full sm:w-auto min-h-11"
          >
            <Pencil className="h-5 w-5" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(os)}
            className="w-full sm:w-auto min-h-11"
          >
            <Trash2 className="h-5 w-5" />
            Excluir
          </Button>
        </div>

        <div
          className={cn(
            "space-y-4 pt-4 border-t border-[#2a2d3e] print:border-gray-300",
            !expandido && "hidden print:block"
          )}
        >
          {os.observacoes && (
            <div className="rounded-xl bg-[#0f1117] border border-[#2a2d3e] p-4 print:bg-white print:border-gray-300">
              <p className="text-sm font-semibold text-slate-300 print:text-black mb-1">
                Observações
              </p>
              <p className="text-sm text-slate-400 print:text-gray-700 whitespace-pre-wrap">
                {os.observacoes}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
              <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full print:bg-black" />
              Itens do Contrato
            </h3>
            <ItensOsList
              itens={os.itens_os ?? []}
              onStatusChange={(itemId, status) => onItemStatusChange(os.id, itemId, status)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t border-[#2a2d3e] print:border-gray-300">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e] print:bg-white print:border-gray-300">
            <div className="flex items-center gap-3">
              {os.nota_emitida ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 print:text-black" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-500 print:text-gray-400" />
              )}
              <Label className="mb-0 text-sm sm:text-base print:text-black">
                Nota Emitida?{" "}
                <span className="hidden print:inline font-normal">
                  — {os.nota_emitida ? "Sim" : "Não"}
                </span>
              </Label>
            </div>
            <div className="flex items-center gap-2 no-print">
              {os.link_drive_nota && (
                <a
                  href={os.link_drive_nota}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir Nota Fiscal no Drive"
                  title="Abrir Nota Fiscal"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#2a2d3e] text-slate-400 hover:text-slate-200 hover:bg-[#1a1d2e] transition-colors"
                >
                  <FileText className="h-4 w-4" />
                </a>
              )}
              <Switch
                checked={os.nota_emitida}
                onCheckedChange={(v) => onToggleFinanceiro(os, "nota_emitida", v)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e] print:bg-white print:border-gray-300">
            <div className="flex items-center gap-3">
              {os.pagamento_recebido ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 print:text-black" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-500 print:text-gray-400" />
              )}
              <Label className="mb-0 text-sm sm:text-base print:text-black">
                Pagamento Recebido?{" "}
                <span className="hidden print:inline font-normal">
                  — {os.pagamento_recebido ? "Sim" : "Não"}
                </span>
              </Label>
            </div>
            <Switch
              className="no-print"
              checked={os.pagamento_recebido}
              onCheckedChange={(v) => onToggleFinanceiro(os, "pagamento_recebido", v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
