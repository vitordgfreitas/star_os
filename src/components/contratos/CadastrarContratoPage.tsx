"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { ContratoForm } from "@/components/contratos/ContratoForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubNav } from "@/components/layout/SubNav";
import { criarContrato } from "@/lib/supabase/contratos";
import type { ContratoInput } from "@/types";

export function CadastrarContratoPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: ContratoInput) {
    setLoading(true);
    try {
      await criarContrato(data);
      setSaved(true);
      setFormKey((k) => k + 1);
      toast.success("Contrato cadastrado com sucesso!", {
        description: `${data.numero_controle} — ${data.orgao}`,
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
        title="Cadastrar Contrato"
        description="Registre um novo contrato de licitação antes de criar ordens de serviço."
      />
      <SubNav />

      {saved && (
        <div className="flex items-center gap-4 rounded-xl border border-emerald-800/50 bg-emerald-950/40 p-5">
          <CheckCircle2 className="h-9 w-9 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-emerald-300">Salvo com sucesso!</p>
            <p className="text-emerald-400/80">Você pode cadastrar outro contrato abaixo.</p>
          </div>
        </div>
      )}

      <ContratoForm key={formKey} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
