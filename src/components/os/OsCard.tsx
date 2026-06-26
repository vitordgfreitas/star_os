"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onLinkChange: (os: OrdemServico, link: string) => void;
  onItemStatusChange: (osId: string, itemId: string, status: StatusItem) => void;
}

export function OsCard({
  os,
  onEdit,
  onDelete,
  onToggleFinanceiro,
  onLinkChange,
  onItemStatusChange,
}: OsCardProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Card className="overflow-hidden hover:border-indigo-500/20 transition-colors duration-200">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Cabeçalho com setinha accordion */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="flex-shrink-0 mt-1 p-2 rounded-lg hover:bg-[#1a1d2e] text-slate-400 hover:text-indigo-300 transition-colors min-h-11 min-w-11 flex items-center justify-center"
            aria-expanded={expandido}
            aria-label={expandido ? "Recolher itens" : "Expandir itens"}
          >
            <ChevronDown
              className={cn("h-5 w-5 transition-transform duration-200", expandido && "rotate-180")}
            />
          </button>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 truncate">
                {os.nome_contrato}
              </h2>
              <StatusBadge status={os.status} />
            </div>
            <p className="text-sm text-slate-400">{os.orgao_publico}</p>
            <p className="text-sm font-medium text-indigo-400">{os.empresa_contratada}</p>
            <p className="text-sm text-slate-500">
              {os.cidade}/{os.estado} — {os.endereco}
            </p>
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 text-sm text-slate-500">
              <span>
                <strong className="text-slate-400">Evento:</strong>{" "}
                {formatDate(os.data_inicio_evento)} até {formatDate(os.data_fim_evento)}
              </span>
              <span>
                <strong className="text-slate-400">Valor:</strong> {formatCurrency(os.valor_total)}
              </span>
              <span>
                <strong className="text-slate-400">Itens:</strong> {os.itens_os?.length ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
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

        {/* Accordion — lista de itens */}
        {expandido && (
          <div className="pt-4 border-t border-[#2a2d3e] animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full" />
              Itens do Contrato
            </h3>
            <ItensOsList
              itens={os.itens_os ?? []}
              onStatusChange={(itemId, status) => onItemStatusChange(os.id, itemId, status)}
            />
          </div>
        )}

        {/* Financeiro */}
        <div className="grid gap-3 sm:grid-cols-2 pt-4 border-t border-[#2a2d3e]">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
            <div className="flex items-center gap-3">
              {os.nota_emitida ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-500" />
              )}
              <Label className="mb-0 text-sm sm:text-base">Nota Emitida?</Label>
            </div>
            <Switch
              checked={os.nota_emitida}
              onCheckedChange={(v) => onToggleFinanceiro(os, "nota_emitida", v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
            <div className="flex items-center gap-3">
              {os.pagamento_recebido ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-500" />
              )}
              <Label className="mb-0 text-sm sm:text-base">Pagamento Recebido?</Label>
            </div>
            <Switch
              checked={os.pagamento_recebido}
              onCheckedChange={(v) => onToggleFinanceiro(os, "pagamento_recebido", v)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`link-${os.id}`}>Link do Google Drive (Nota Fiscal)</Label>
          <div className="flex gap-3 mt-1">
            <Input
              id={`link-${os.id}`}
              defaultValue={os.link_drive_nota ?? ""}
              placeholder="Cole o link do Drive aqui..."
              onBlur={(e) => {
                if (e.target.value !== (os.link_drive_nota ?? "")) {
                  onLinkChange(os, e.target.value);
                }
              }}
            />
            {os.link_drive_nota && (
              <Button variant="outline" size="icon" asChild>
                <a
                  href={os.link_drive_nota}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir link do Drive"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
