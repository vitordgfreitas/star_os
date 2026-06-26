"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { OsForm } from "@/components/os/OsForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { criarOrdemServico } from "@/lib/supabase/ordens-servico";
import type { OrdemServicoInput } from "@/types";

export function CadastrarOsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: OrdemServicoInput) {
    setLoading(true);
    try {
      await criarOrdemServico(data);
      setSaved(true);
      setFormKey((k) => k + 1);
      toast.success("Ordem de Serviço cadastrada com sucesso!", {
        description: `${data.orgao_publico} — ${data.cidade}/${data.estado}`,
        duration: 5000,
      });
    } catch (err) {
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar Ordem de Serviço"
        description="Preencha os dados abaixo para registrar um novo contrato de aluguel."
      />

      {saved && (
        <div className="flex items-center gap-4 rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-5">
          <CheckCircle2 className="h-9 w-9 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-emerald-300">Salvo com sucesso!</p>
            <p className="text-emerald-400/80">
              A ordem de serviço foi registrada. Você pode cadastrar outra abaixo.
            </p>
          </div>
        </div>
      )}

      <OsForm
        key={formKey}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Salvar Ordem de Serviço"
      />
    </div>
  );
}
