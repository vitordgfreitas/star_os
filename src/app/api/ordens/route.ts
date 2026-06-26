import { NextResponse } from "next/server";
import {
  listarOrdensServico,
  criarOrdemServico,
} from "@/lib/supabase/ordens-servico";
import type { OrdemServicoInput } from "@/types";

export async function GET() {
  try {
    const ordens = await listarOrdensServico();
    return NextResponse.json(ordens);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao listar ordens" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrdemServicoInput;
    const criada = await criarOrdemServico(body);
    return NextResponse.json(criada, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar ordem" },
      { status: 500 }
    );
  }
}
