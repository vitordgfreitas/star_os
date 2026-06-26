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
        <p className="text-xl text-gray-600">Carregando ordens de serviço...</p>
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
            <p className="text-lg text-slate-600">
              Nenhuma ordem de serviço cadastrada ainda.
            </p>
            <p className="text-slate-400 mt-2 text-sm">
              Use o menu &quot;Cadastrar OS&quot; para adicionar a primeira.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordens.map((os) => (
            <Card key={os.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-slate-200/80">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        {os.orgao_publico}
                      </h2>
                      <StatusBadge status={os.status} />
                    </div>
                    <p className="text-base text-slate-600">
                      {os.cidade}/{os.estado} — {os.endereco}
                    </p>
                    <div className="flex flex-wrap gap-6 text-base text-gray-600">
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
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOs(os)}
                    >
                      <Pencil className="h-5 w-5" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(os)}
                    >
                      <Trash2 className="h-5 w-5" />
                      Excluir
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      {os.nota_emitida ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}
                      <Label className="mb-0 text-lg">Nota Emitida?</Label>
                    </div>
                    <Switch
                      checked={os.nota_emitida}
                      onCheckedChange={(v) => handleToggleFinanceiro(os, "nota_emitida", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      {os.pagamento_recebido ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}
                      <Label className="mb-0 text-lg">Pagamento Recebido?</Label>
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
          <p className="text-lg text-gray-700">
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
