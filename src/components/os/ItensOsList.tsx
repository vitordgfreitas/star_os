"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ItemStatusSelect } from "@/components/os/ItemStatusSelect";
import { atualizarStatusItem } from "@/lib/supabase/ordens-servico";
import type { ItemOS, StatusItem } from "@/types";

interface ItensOsListProps {
  itens: ItemOS[];
  onStatusChange?: (itemId: string, status: StatusItem) => void;
  compact?: boolean;
}

export function ItensOsList({ itens, onStatusChange, compact }: ItensOsListProps) {
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleStatusChange(item: ItemOS, status: StatusItem) {
    if (!item.id) return;
    setSavingId(item.id);
    try {
      await atualizarStatusItem(item.id, status);
      onStatusChange?.(item.id, status);
      toast.success(`"${item.nome_item}" → ${status}`);
    } catch (err) {
      toast.error("Erro ao salvar status", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSavingId(null);
    }
  }

  if (itens.length === 0) {
    return <p className="text-slate-500 text-sm py-2">Nenhum item cadastrado.</p>;
  }

  return (
    <div className="space-y-2">
      {itens.map((item) => (
        <div
          key={item.id ?? item.nome_item}
          className={
            compact
              ? "flex flex-col gap-3 p-3 rounded-lg bg-[#0f1117] border border-[#2a2d3e] sm:flex-row sm:items-center sm:justify-between"
              : "flex flex-col gap-3 p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e] sm:flex-row sm:items-center sm:justify-between"
          }
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-100 truncate">{item.nome_item}</p>
            <p className="text-sm text-slate-500 mt-0.5">Quantidade: {item.quantidade}x</p>
          </div>
          <div className="w-full sm:w-auto sm:shrink-0">
            <ItemStatusSelect
              value={item.status_item ?? "Pendente"}
              onChange={(s) => handleStatusChange(item, s)}
              disabled={savingId === item.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
