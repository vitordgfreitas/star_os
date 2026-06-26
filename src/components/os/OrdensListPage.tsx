"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OsForm } from "@/components/os/OsForm";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  listarOrdensServico,
  atualizarOrdemServico,
  atualizarCamposFinanceiros,
  excluirOrdemServico,
} from "@/lib/supabase/ordens-servico";
import type { OrdemServico, OrdemServicoInput } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrdensListPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOs, setEditOs] = useState<OrdemServico | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<OrdemServico | null>(null);

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
        description={`${ordens.length} ordem${ordens.length !== 1 ? "ns" : ""} cadastrada${ordens.length !== 1 ? "s" : ""}`}
      />

      {ordens.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg text-slate-400">
              Nenhuma ordem de serviço cadastrada ainda.
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              Use o menu &quot;Cadastrar OS&quot; para adicionar a primeira.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordens.map((os) => (
            <Card key={os.id} className="overflow-hidden hover:border-indigo-500/20 transition-colors duration-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-100">
                        {os.orgao_publico}
                      </h2>
                      <StatusBadge status={os.status} />
                    </div>
                    <p className="text-sm font-medium text-indigo-400">
                      {os.empresa_contratada}
                    </p>
                    <p className="text-base text-slate-400">
                      {os.cidade}/{os.estado} — {os.endereco}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1 text-sm sm:text-base text-slate-500">
                      <span>
                        <strong>Evento:</strong> {formatDate(os.data_inicio_evento)} até{" "}
                        {formatDate(os.data_fim_evento)}
                      </span>
                      <span>
                        <strong>Valor:</strong> {formatCurrency(os.valor_total)}
                      </span>
                      <span>
                        <strong>Itens:</strong> {os.itens_os?.length ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOs(os)}
                      className="w-full sm:w-auto min-h-11"
                    >
                      <Pencil className="h-5 w-5" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(os)}
                      className="w-full sm:w-auto min-h-11"
                    >
                      <Trash2 className="h-5 w-5" />
                      Excluir
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-[#2a2d3e]">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
                    <div className="flex items-center gap-3">
                      {os.nota_emitida ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}
                      <Label className="mb-0 text-base sm:text-lg">Nota Emitida?</Label>
                    </div>
                    <Switch
                      checked={os.nota_emitida}
                      onCheckedChange={(v) => handleToggleFinanceiro(os, "nota_emitida", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
                    <div className="flex items-center gap-3">
                      {os.pagamento_recebido ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}
                      <Label className="mb-0 text-base sm:text-lg">Pagamento Recebido?</Label>
                    </div>
                    <Switch
                      checked={os.pagamento_recebido}
                      onCheckedChange={(v) =>
                        handleToggleFinanceiro(os, "pagamento_recebido", v)
                      }
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
                          handleLinkChange(os, e.target.value);
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
            Tem certeza que deseja excluir a ordem de serviço de{" "}
            <strong>{deleteConfirm?.orgao_publico}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-4 mt-4">
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
