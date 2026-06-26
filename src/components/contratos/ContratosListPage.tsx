"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkIconButton } from "@/components/ui/link-icon-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContratoForm } from "@/components/contratos/ContratoForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import {
  listarContratos,
  atualizarContrato,
  excluirContrato,
} from "@/lib/supabase/contratos";
import type { Contrato, ContratoInput } from "@/types";
import { formatDate } from "@/lib/utils";

export function ContratosListPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [editContrato, setEditContrato] = useState<Contrato | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Contrato | null>(null);
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setContratos(await listarContratos());
    } catch (err) {
      toast.error("Erro ao carregar contratos", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleEditSubmit(data: ContratoInput) {
    if (!editContrato) return;
    setSaving(true);
    try {
      const atualizado = await atualizarContrato(editContrato.id, data);
      setContratos((prev) => prev.map((c) => (c.id === editContrato.id ? atualizado : c)));
      setEditContrato(null);
      toast.success("Contrato atualizado!");
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
      await excluirContrato(deleteConfirm.id);
      setContratos((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Contrato excluído.");
    } catch (err) {
      toast.error("Erro ao excluir", {
        description:
          err instanceof Error
            ? err.message.includes("foreign key")
              ? "Este contrato possui ordens de serviço vinculadas."
              : err.message
            : "Tente novamente.",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-slate-400">Carregando contratos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Contratos de licitação vinculados às ordens de serviço."
      />
      <SubNav />

      {contratos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg text-slate-400">Nenhum contrato cadastrado.</p>
            <p className="text-slate-500 mt-2">Use &quot;Cadastrar Contrato&quot; no menu acima.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contratos.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 print:text-black">{c.numero_controle}</h2>
                  <p className="text-base text-slate-400 mt-1 print:text-gray-700">{c.orgao}</p>
                  <p className="text-sm text-slate-500 mt-2 print:text-gray-600">
                    {formatDate(c.data_inicio)} até {formatDate(c.data_fim)}
                  </p>
                  {c.observacoes && (
                    <p className="text-sm text-slate-400 mt-3 print:text-gray-700 whitespace-pre-wrap">
                      <strong className="text-slate-300 print:text-black">Observações:</strong>{" "}
                      {c.observacoes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  {c.link_pdf_drive && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                      <LinkIconButton
                        href={c.link_pdf_drive}
                        label="Abrir PDF do contrato"
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setEditContrato(c)}
                    className="min-h-12 no-print"
                  >
                    <Pencil className="h-5 w-5" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => setDeleteConfirm(c)}
                    className="min-h-12 no-print"
                  >
                    <Trash2 className="h-5 w-5" />
                    Excluir
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editContrato} onOpenChange={(open) => !open && setEditContrato(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
          </DialogHeader>
          {editContrato && (
            <ContratoForm
              initialData={editContrato}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditContrato(null)}
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
            Excluir o contrato <strong>{deleteConfirm?.numero_controle}</strong>?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button variant="destructive" size="lg" onClick={handleDelete} className="flex-1 min-h-12">
              Sim, Excluir
            </Button>
            <Button variant="outline" size="lg" onClick={() => setDeleteConfirm(null)} className="flex-1 min-h-12">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
