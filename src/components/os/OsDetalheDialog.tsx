"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { ItensOsList } from "@/components/os/ItensOsList";
import type { OrdemServico, StatusItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OsDetalheDialogProps {
  os: OrdemServico | null;
  onClose: () => void;
  onItemStatusChange?: (itemId: string, status: StatusItem) => void;
}

export function OsDetalheDialog({ os, onClose, onItemStatusChange }: OsDetalheDialogProps) {
  return (
    <Dialog open={!!os} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {os && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                {os.contratos?.numero_controle || os.nome_contrato}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={os.status} />
                <span className="text-base text-slate-400">{os.orgao_publico}</span>
                <span className="text-base text-slate-400">
                  {os.cidade}/{os.estado}
                </span>
              </div>

              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">
                {os.empresa_contratada}
              </p>

              <div className="grid gap-3 text-sm sm:text-base text-slate-300 bg-[#0f1117] rounded-xl p-4 border border-[#2a2d3e]">
                <p>
                  <span className="font-semibold text-slate-100">Endereço:</span> {os.endereco}
                </p>
                <p>
                  <span className="font-semibold text-slate-100">Período:</span>{" "}
                  {formatDate(os.data_inicio_evento)} até {formatDate(os.data_fim_evento)}
                </p>
                <p>
                  <span className="font-semibold text-slate-100">Valor:</span>{" "}
                  {formatCurrency(os.valor_total)}
                </p>
              </div>

              {os.observacoes && (
                <div className="rounded-xl bg-[#0f1117] border border-[#2a2d3e] p-4">
                  <p className="text-sm font-semibold text-slate-200 mb-1">Observações</p>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{os.observacoes}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <span className="inline-block w-1 h-5 bg-indigo-500 rounded-full" />
                  Itens — Status Logístico
                </h3>
                <ItensOsList
                  itens={os.itens_os ?? []}
                  onStatusChange={onItemStatusChange}
                  compact
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
