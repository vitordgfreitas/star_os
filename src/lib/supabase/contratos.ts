import { supabase } from "./client";
import type { Contrato, ContratoInput } from "@/types";

export async function listarContratos(): Promise<Contrato[]> {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .order("data_inicio", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Contrato[];
}

export async function buscarContrato(id: string): Promise<Contrato | null> {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as Contrato;
}

export async function criarContrato(input: ContratoInput): Promise<Contrato> {
  const { data, error } = await supabase.from("contratos").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Contrato;
}

export async function atualizarContrato(
  id: string,
  input: Partial<ContratoInput>
): Promise<Contrato> {
  const { data, error } = await supabase
    .from("contratos")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Contrato;
}

export async function excluirContrato(id: string): Promise<void> {
  const { error } = await supabase.from("contratos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
