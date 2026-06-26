import { NextResponse } from "next/server";
import {
  buscarOrdemServico,
  atualizarOrdemServico,
  excluirOrdemServico,
} from "@/lib/supabase/ordens-servico";
import type { OrdemServicoInput } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ordem = await buscarOrdemServico(id);
    if (!ordem) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 });
    }
    return NextResponse.json(ordem);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar ordem" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<OrdemServicoInput>;
    const atualizada = await atualizarOrdemServico(id, body);
    return NextResponse.json(atualizada);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar ordem" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await excluirOrdemServico(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao excluir ordem" },
      { status: 500 }
    );
  }
}
