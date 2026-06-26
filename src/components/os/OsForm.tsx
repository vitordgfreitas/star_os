"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contrato, OrdemServico, OrdemServicoInput, StatusItem, StatusOS } from "@/types";
import { listarContratos } from "@/lib/supabase/contratos";
import { formatDate, toDateInputValue } from "@/lib/utils";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const STATUS_OPTIONS: StatusOS[] = ["Pendente", "Em Andamento", "Concluído"];

interface ItemRow {
  key: string;
  nome_item: string;
  quantidade: number| "";
  status_item: StatusItem;
}

let itemKeyCounter = 0;

function createEmptyItem(): ItemRow {
  itemKeyCounter += 1;
  return { key: `item-${itemKeyCounter}`, nome_item: "", quantidade: "", status_item: "Pendente" };
}

function itensFromOrdem(os?: OrdemServico): ItemRow[] {
  if (os?.itens_os?.length) {
    return os.itens_os.map((i) => ({
      key: i.id ?? `item-${i.nome_item}`,
      nome_item: i.nome_item,
      quantidade: i.quantidade,
      status_item: i.status_item ?? "Pendente",
    }));
  }
  return [{ key: "item-initial", nome_item: "", quantidade: "", status_item: "Pendente" }];
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value + "T12:00:00");
}

interface OsFormProps {
  initialData?: OrdemServico;
  onSubmit: (data: OrdemServicoInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function OsForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Salvar Ordem de Serviço",
  loading = false,
}: OsFormProps) {
  const [dataCadastro, setDataCadastro] = useState<Date | undefined>(
    initialData ? parseDate(initialData.data_cadastro) : new Date()
  );
  const [cidade, setCidade] = useState(initialData?.cidade ?? "");
  const [estado, setEstado] = useState(initialData?.estado ?? "");
  const [contratoId, setContratoId] = useState(initialData?.contrato_id ?? "");
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [carregandoContratos, setCarregandoContratos] = useState(true);
  const [orgaoPublico, setOrgaoPublico] = useState(initialData?.orgao_publico ?? "");
  const [nomeContrato, setNomeContrato] = useState(initialData?.nome_contrato ?? "");
  const [empresaContratada, setEmpresaContratada] = useState(initialData?.empresa_contratada ?? "");
  const [endereco, setEndereco] = useState(initialData?.endereco ?? "");
  const [valorTotal, setValorTotal] = useState(
    initialData ? String(initialData.valor_total) : ""
  );
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    initialData ? parseDate(initialData.data_inicio_evento) : undefined
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    initialData ? parseDate(initialData.data_fim_evento) : undefined
  );
  const [status, setStatus] = useState<StatusOS>(initialData?.status ?? "Pendente");
  const [notaEmitida, setNotaEmitida] = useState(initialData?.nota_emitida ?? false);
  const [linkDriveNota, setLinkDriveNota] = useState(initialData?.link_drive_nota ?? "");
  const [pagamentoRecebido, setPagamentoRecebido] = useState(
    initialData?.pagamento_recebido ?? false
  );
  const [itens, setItens] = useState<ItemRow[]>(() => itensFromOrdem(initialData));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    listarContratos()
      .then(setContratos)
      .catch(() => setContratos([]))
      .finally(() => setCarregandoContratos(false));
  }, []);

  function handleContratoChange(id: string) {
    setContratoId(id);
    const contrato = contratos.find((c) => c.id === id);
    if (contrato) {
      setOrgaoPublico(contrato.orgao);
      setNomeContrato(contrato.numero_controle);
    }
  }

  function addItem() {
    setItens((prev) => [...prev, createEmptyItem()]);
  }

  function removeItem(key: string) {
    setItens((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));
  }

  function updateItem(key: string, field: "nome_item" | "quantidade", value: string) {
    setItens((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
            ...item,
            [field]: field === "quantidade" 
              ? (value === "" ? "" : Math.max(1, parseInt(value) || 1)) // <-- Permite string vazia
              : value,
            }
          : item
      )
    );
  }

  function validate(): boolean {
    const newErrors: string[] = [];
    if (!contratoId) newErrors.push("Selecione o contrato vinculado.");
    if (!cidade.trim()) newErrors.push("Informe a cidade.");
    if (!estado) newErrors.push("Selecione o estado.");
    if (!orgaoPublico.trim()) newErrors.push("Informe o órgão público.");
    if (!empresaContratada.trim()) newErrors.push("Informe a empresa contratada.");
    if (!endereco.trim()) newErrors.push("Informe o endereço.");
    if (!valorTotal || parseFloat(valorTotal) < 0) newErrors.push("Informe o valor total.");
    if (!dataCadastro) newErrors.push("Informe a data de cadastro.");
    if (!dataInicio) newErrors.push("Informe a data de início do evento.");
    if (!dataFim) newErrors.push("Informe a data de fim do evento.");
    if (dataInicio && dataFim && dataFim < dataInicio) {
      newErrors.push("A data de fim deve ser igual ou posterior à data de início.");
    }
    const itensValidos = itens.filter((i) => i.nome_item.trim());
    if (itensValidos.length === 0) newErrors.push("Adicione pelo menos um item.");

    setErrors(newErrors);
    return newErrors.length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: OrdemServicoInput = {
      contrato_id: contratoId,
      data_cadastro: toDateInputValue(dataCadastro!),
      cidade: cidade.trim(),
      estado,
      orgao_publico: orgaoPublico.trim(),
      nome_contrato: nomeContrato.trim(),
      empresa_contratada: empresaContratada.trim(),
      endereco: endereco.trim(),
      valor_total: parseFloat(valorTotal),
      data_inicio_evento: toDateInputValue(dataInicio!),
      data_fim_evento: toDateInputValue(dataFim!),
      status,
      nota_emitida: notaEmitida,
      link_drive_nota: linkDriveNota.trim() || null,
      pagamento_recebido: pagamentoRecebido,
      itens: itens
        .filter((i) => i.nome_item.trim())
        .map((i) => ({
          nome_item: i.nome_item.trim(),
          quantidade: Number(i.quantidade) || 1, // Força a conversão para número
          status_item: i.status_item,
        })),
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-4">
          <p className="text-lg font-semibold text-red-300 mb-2">
            Por favor, corrija os seguintes campos:
          </p>
          <ul className="list-disc list-inside text-red-400 space-y-1">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Data de Cadastro</Label>
            <DatePicker value={dataCadastro} onChange={setDataCadastro} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusOS)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="contrato">Contrato Vinculado</Label>
            <Select
              value={contratoId}
              onValueChange={handleContratoChange}
              disabled={carregandoContratos}
            >
              <SelectTrigger id="contrato" className="min-h-12 text-base">
                <SelectValue
                  placeholder={
                    carregandoContratos
                      ? "Carregando contratos..."
                      : contratos.length === 0
                        ? "Nenhum contrato cadastrado"
                        : "Selecione o contrato"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {contratos.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-base py-3">
                    {c.numero_controle} — {c.orgao} ({formatDate(c.data_inicio)} a{" "}
                    {formatDate(c.data_fim)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contratos.length === 0 && !carregandoContratos && (
              <p className="text-sm text-amber-400 mt-2">
                Cadastre um contrato antes de criar uma OS.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="orgao">Órgão Público</Label>
            <Input
              id="orgao"
              value={orgaoPublico}
              onChange={(e) => setOrgaoPublico(e.target.value)}
              placeholder="Preenchido pelo contrato"
            />
          </div>
          <div>
            <Label htmlFor="empresa">Empresa Contratada</Label>
            <Input
              id="empresa"
              value={empresaContratada}
              onChange={(e) => setEmpresaContratada(e.target.value)}
              placeholder="Ex: Star Locações, Empresa XYZ..."
            />
          </div>
          <div>
            <Label htmlFor="valor">Valor Total (R$)</Label>
            <Input
              id="valor"
              type="number"
              min="0"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Nome da cidade"
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado (UF)</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input
              id="endereco"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datas do Evento</CardTitle>
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
              placeholder="Quando começa o evento?"
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
                  ? "Quando termina o evento?"
                  : "Selecione a data de início primeiro"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens para Enviar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itens.map((item, index) => (
            <div
              key={item.key}
              className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]"
            >
              <div className="flex-1 w-full">
                <Label htmlFor={`item-nome-${item.key}`}>
                  Item {index + 1} — Nome
                </Label>
                <Input
                  id={`item-nome-${item.key}`}
                  value={item.nome_item}
                  onChange={(e) => updateItem(item.key, "nome_item", e.target.value)}
                  placeholder="Ex: Tenda 3x3, Cadeira plástica..."
                />
              </div>
              <div className="w-full sm:w-32">
                <Label htmlFor={`item-qtd-${item.key}`}>Quantidade</Label>
                <Input
                  id={`item-qtd-${item.key}`}
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => updateItem(item.key, "quantidade", e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeItem(item.key)}
                aria-label="Remover item"
                className="flex-shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="success" size="lg" onClick={addItem} className="w-full sm:w-auto">
            <Plus className="h-6 w-6" />
            Adicionar Novo Item
          </Button>
        </CardContent>
      </Card>

      {initialData && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
              <Label htmlFor="nota" className="mb-0 text-xl">
                Nota Emitida?
              </Label>
              <input
                id="nota"
                type="checkbox"
                checked={notaEmitida}
                onChange={(e) => setNotaEmitida(e.target.checked)}
                className="h-8 w-8 accent-slate-700 cursor-pointer"
              />
            </div>
            <div>
              <Label htmlFor="link">Link do Google Drive (Nota Fiscal)</Label>
              <Input
                id="link"
                value={linkDriveNota}
                onChange={(e) => setLinkDriveNota(e.target.value)}
                placeholder="Cole aqui o link do Drive..."
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f1117] border border-[#2a2d3e]">
              <Label htmlFor="pagamento" className="mb-0 text-xl">
                Pagamento Recebido?
              </Label>
              <input
                id="pagamento"
                type="checkbox"
                checked={pagamentoRecebido}
                onChange={(e) => setPagamentoRecebido(e.target.checked)}
                className="h-8 w-8 accent-slate-700 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" variant="default" size="lg" disabled={loading} className="flex-1">
          {loading ? "Salvando..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
