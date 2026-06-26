"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OsForm } from "@/components/os/OsForm";
import { OsFilters } from "@/components/os/OsFilters";
import { OsCard } from "@/components/os/OsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import {
  listarOrdensServico,
  atualizarOrdemServico,
  atualizarCamposFinanceiros,
  excluirOrdemServico,
} from "@/lib/supabase/ordens-servico";
import { filtrarEOrdenarOrdens, FILTROS_PADRAO } from "@/lib/ordens-filtros";
import type { FiltrosOS, OrdemServico, OrdemServicoInput, StatusItem } from "@/types";

export function OrdensListPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosOS>(() => ({ ...FILTROS_PADRAO }));
  const [editOs, setEditOs] = useState<OrdemServico | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<OrdemServico | null>(null);

  const ordensFiltradas = useMemo(
    () => filtrarEOrdenarOrdens(ordens, filtros),
    [ordens, filtros.busca, filtros.dataInicio, filtros.dataFim, filtros.ordenacao]
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarOrdensServico();
      setOrdens(data);
    } catch (err) {
      toast.error("Erro ao carregar ordens", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleItemStatusChange(osId: string, itemId: string, status: StatusItem) {
    setOrdens((prev) =>
      prev.map((o) =>
        o.id === osId
          ? {
              ...o,
              itens_os: o.itens_os?.map((i) =>
                i.id === itemId ? { ...i, status_item: status } : i
              ),
            }
          : o
      )
    );
    if (editOs?.id === osId) {
      setEditOs((prev) =>
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
  }

  async function handleToggleFinanceiro(
    os: OrdemServico,
    campo: "nota_emitida" | "pagamento_recebido",
    valor: boolean
  ) {
    try {
      await atualizarCamposFinanceiros(os.id, { [campo]: valor });
      setOrdens((prev) =>
        prev.map((o) => (o.id === os.id ? { ...o, [campo]: valor } : o))
      );
      toast.success(valor ? "Marcado como sim!" : "Marcado como não.");
    } catch (err) {
      toast.error("Erro ao atualizar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  }

  async function handleLinkChange(os: OrdemServico, link: string) {
    try {
      await atualizarCamposFinanceiros(os.id, {
        link_drive_nota: link.trim() || null,
      });
      setOrdens((prev) =>
        prev.map((o) =>
          o.id === os.id ? { ...o, link_drive_nota: link.trim() || null } : o
        )
      );
    } catch (err) {
      toast.error("Erro ao salvar link", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  }

  async function handleEditSubmit(data: OrdemServicoInput) {
    if (!editOs) return;
    setSaving(true);
    try {
      const atualizada = await atualizarOrdemServico(editOs.id, data);
      setOrdens((prev) => prev.map((o) => (o.id === editOs.id ? atualizada : o)));
      setEditOs(null);
      toast.success("Ordem de Serviço atualizada!");
    } catch (err) {
      toast.error("Erro ao atualizar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await excluirOrdemServico(deleteConfirm.id);
      setOrdens((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Ordem de Serviço excluída.");
    } catch (err) {
      toast.error("Erro ao excluir", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-slate-400">Carregando ordens de serviço...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie ordens, itens e status logístico."
      />
      <SubNav />

      <OsFilters
        filtros={filtros}
        onChange={setFiltros}
        totalFiltrado={ordensFiltradas.length}
        totalGeral={ordens.length}
      />

      {ordens.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg text-slate-400">Nenhuma ordem de serviço cadastrada ainda.</p>
            <p className="text-slate-500 mt-2 text-sm">
              Use o menu &quot;Cadastrar OS&quot; para adicionar a primeira.
            </p>
          </CardContent>
        </Card>
      ) : ordensFiltradas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-slate-400">Nenhum resultado para os filtros aplicados.</p>
            <button
              type="button"
              onClick={() => setFiltros({ ...FILTROS_PADRAO })}
              className="mt-3 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
            >
              Limpar filtros
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordensFiltradas.map((os) => (
            <OsCard
              key={os.id}
              os={os}
              onEdit={setEditOs}
              onDelete={setDeleteConfirm}
              onToggleFinanceiro={handleToggleFinanceiro}
              onLinkChange={handleLinkChange}
              onItemStatusChange={handleItemStatusChange}
            />
          ))}
        </div>
      )}

      <Dialog open={!!editOs} onOpenChange={(open) => !open && setEditOs(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {editOs && (
            <OsForm
              initialData={editOs}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditOs(null)}
              loading={saving}
              submitLabel="Salvar Alterações"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-lg text-slate-300">
            Tem certeza que deseja excluir{" "}
            <strong>{deleteConfirm?.nome_contrato}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button variant="destructive" size="lg" onClick={handleDelete} className="flex-1">
              Sim, Excluir
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
