"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import type { Contrato, ContratoInput } from "@/types";
import { toDateInputValue } from "@/lib/utils";

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value + "T12:00:00");
}

interface ContratoFormProps {
  initialData?: Contrato;
  onSubmit: (data: ContratoInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ContratoForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Salvar Contrato",
  loading = false,
}: ContratoFormProps) {
  const [orgao, setOrgao] = useState(initialData?.orgao ?? "");
  const [numeroControle, setNumeroControle] = useState(initialData?.numero_controle ?? "");
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    initialData ? parseDate(initialData.data_inicio) : undefined
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    initialData ? parseDate(initialData.data_fim) : undefined
  );
  const [linkPdf, setLinkPdf] = useState(initialData?.link_pdf_drive ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): boolean {
    const newErrors: string[] = [];
    if (!orgao.trim()) newErrors.push("Informe o órgão.");
    if (!numeroControle.trim()) newErrors.push("Informe o número de controle.");
    if (!dataInicio) newErrors.push("Informe a data de início.");
    if (!dataFim) newErrors.push("Informe a data de fim.");
    if (dataInicio && dataFim && dataFim < dataInicio) {
      newErrors.push("A data de fim deve ser igual ou posterior à data de início.");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      orgao: orgao.trim(),
      numero_controle: numeroControle.trim(),
      data_inicio: toDateInputValue(dataInicio!),
      data_fim: toDateInputValue(dataFim!),
      link_pdf_drive: linkPdf.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-4">
          <p className="text-lg font-semibold text-red-300 mb-2">Corrija os campos:</p>
          <ul className="list-disc list-inside text-red-400 space-y-1">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="orgao">Órgão</Label>
            <Input
              id="orgao"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              placeholder="Ex: Prefeitura Municipal"
              className="text-lg min-h-12"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="numero">Número de Controle</Label>
            <Input
              id="numero"
              value={numeroControle}
              onChange={(e) => setNumeroControle(e.target.value)}
              placeholder="Ex: CT-2026-001"
              className="text-lg min-h-12"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="link">Link do PDF no Drive (opcional)</Label>
            <div className="flex gap-3 mt-1">
              <Input
                id="link"
                value={linkPdf}
                onChange={(e) => setLinkPdf(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="text-base min-h-12"
              />
              {linkPdf && (
                <Button variant="outline" size="icon" asChild className="min-h-12 min-w-12">
                  <a href={linkPdf} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Datas do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Data de Início</Label>
            <DatePicker
              value={dataInicio}
              onChange={(d) => {
                setDataInicio(d);
                if (d && dataFim && d > dataFim) setDataFim(undefined);
              }}
              rangeFrom={dataInicio}
              rangeTo={dataFim}
              maxDate={dataFim}
              placeholder="Quando começa o contrato?"
            />
          </div>
          <div>
            <Label>Data de Fim</Label>
            <DatePicker
              value={dataFim}
              onChange={setDataFim}
              minDate={dataInicio}
              openToMonth={dataInicio}
              rangeFrom={dataInicio}
              rangeTo={dataFim}
              disabled={!dataInicio}
              placeholder={
                dataInicio
                  ? "Quando termina o contrato?"
                  : "Selecione a data de início primeiro"
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" size="lg" disabled={loading} className="flex-1 min-h-14 text-lg">
          {loading ? "Salvando..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={loading} className="min-h-14">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
