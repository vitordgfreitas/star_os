export type StatusOS = "Pendente" | "Em Andamento" | "Concluído";

export interface ItemOS {
  id?: string;
  os_id?: string;
  nome_item: string;
  quantidade: number;
}

export interface OrdemServico {
  id: string;
  data_cadastro: string;
  cidade: string;
  estado: string;
  orgao_publico: string;
  empresa_contratada: string;
  endereco: string;
  valor_total: number;
  data_inicio_evento: string;
  data_fim_evento: string;
  status: StatusOS;
  nota_emitida: boolean;
  link_drive_nota: string | null;
  pagamento_recebido: boolean;
  created_at?: string;
  updated_at?: string;
  itens_os?: ItemOS[];
}

export interface OrdemServicoInput {
  data_cadastro: string;
  cidade: string;
  estado: string;
  orgao_publico: string;
  empresa_contratada: string;
  endereco: string;
  valor_total: number;
  data_inicio_evento: string;
  data_fim_evento: string;
  status: StatusOS;
  nota_emitida?: boolean;
  link_drive_nota?: string | null;
  pagamento_recebido?: boolean;
  itens: Omit<ItemOS, "id" | "os_id">[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: OrdemServico;
}
