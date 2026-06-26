import { supabase } from "./client";
import type { OrdemServico, OrdemServicoInput, ItemOS, StatusItem } from "@/types";

/** Busca todas as ordens de serviço com seus itens */
export async function listarOrdensServico(): Promise<OrdemServico[]> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*, itens_os(*)");

  if (error) throw new Error(error.message);
  return (data ?? []) as OrdemServico[];
}

/** Busca uma ordem de serviço pelo ID */
export async function buscarOrdemServico(id: string): Promise<OrdemServico | null> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*, itens_os(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as OrdemServico;
}

/** Atualiza o status de um item individualmente */
export async function atualizarStatusItem(
  itemId: string,
  status_item: StatusItem
): Promise<ItemOS> {
  const { data, error } = await supabase
    .from("itens_os")
    .update({ status_item })
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ItemOS;
}

/** Cria uma nova ordem de serviço com itens */
export async function criarOrdemServico(input: OrdemServicoInput): Promise<OrdemServico> {
  const { itens, ...osData } = input;

  const { data: os, error: osError } = await supabase
    .from("ordens_servico")
    .insert(osData)
    .select()
    .single();

  if (osError) throw new Error(osError.message);

  if (itens.length > 0) {
    const itensComOsId = itens.map((item) => ({
      os_id: os.id,
      nome_item: item.nome_item,
      quantidade: item.quantidade,
      status_item: item.status_item ?? "Pendente",
    }));

    const { error: itensError } = await supabase.from("itens_os").insert(itensComOsId);

    if (itensError) throw new Error(itensError.message);
  }

  const criada = await buscarOrdemServico(os.id);
  if (!criada) throw new Error("Erro ao recuperar OS criada.");
  return criada;
}

/** Atualiza uma ordem de serviço e substitui todos os itens */
export async function atualizarOrdemServico(
  id: string,
  input: Partial<OrdemServicoInput> & { itens?: Omit<ItemOS, "id" | "os_id">[] }
): Promise<OrdemServico> {
  const { itens, ...osData } = input;

  if (Object.keys(osData).length > 0) {
    const { error: osError } = await supabase
      .from("ordens_servico")
      .update(osData)
      .eq("id", id);

    if (osError) throw new Error(osError.message);
  }

  if (itens !== undefined) {
    const { error: deleteError } = await supabase
      .from("itens_os")
      .delete()
      .eq("os_id", id);

    if (deleteError) throw new Error(deleteError.message);

    if (itens.length > 0) {
      const itensComOsId = itens.map((item) => ({
        os_id: id,
        nome_item: item.nome_item,
        quantidade: item.quantidade,
        status_item: item.status_item ?? "Pendente",
      }));

      const { error: itensError } = await supabase.from("itens_os").insert(itensComOsId);

      if (itensError) throw new Error(itensError.message);
    }
  }

  const atualizada = await buscarOrdemServico(id);
  if (!atualizada) throw new Error("Erro ao recuperar OS atualizada.");
  return atualizada;
}

/** Atualiza campos financeiros rapidamente (nota / pagamento) */
export async function atualizarCamposFinanceiros(
  id: string,
  campos: {
    nota_emitida?: boolean;
    pagamento_recebido?: boolean;
    link_drive_nota?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("ordens_servico").update(campos).eq("id", id);

  if (error) throw new Error(error.message);
}

/** Exclui uma ordem de serviço (itens são removidos em cascata) */
export async function excluirOrdemServico(id: string): Promise<void> {
  const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Busca ordens que intersectam um período (para o calendário) */
export async function listarOrdensPorPeriodo(
  inicio: string,
  fim: string
): Promise<OrdemServico[]> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*, itens_os(*)")
    .lte("data_inicio_evento", fim)
    .gte("data_fim_evento", inicio)
    .order("data_inicio_evento", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrdemServico[];
}
