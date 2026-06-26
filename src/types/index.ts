export type StatusOS = "Pendente" | "Em Andamento" | "Concluído";

export type StatusItem =
  | "Pendente"
  | "Separado"
  | "Entregue"
  | "Concluído"
  | "Recolhido";

export const STATUS_ITEM_OPTIONS: StatusItem[] = [
  "Pendente",
  "Separado",
  "Entregue",
  "Concluído",
  "Recolhido",
];

export type OrdenacaoOS = "data" | "alfabetica";

export interface FiltrosOS {
  busca: string;
  ordenacao: OrdenacaoOS;
  dataInicio?: string;
  dataFim?: string;
}

export interface Contrato {
  id: string;
  orgao: string;
  data_inicio: string;
  data_fim: string;
  numero_controle: string;
  link_pdf_drive: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContratoInput {
  orgao: string;
  data_inicio: string;
  data_fim: string;
  numero_controle: string;
  link_pdf_drive?: string | null;
}

export interface ItemOS {
  id?: string;
  os_id?: string;
  nome_item: string;
  quantidade: number;
  status_item?: StatusItem;
}

export interface OrdemServico {
  id: string;
  contrato_id: string;
  data_cadastro: string;
  cidade: string;
  estado: string;
  orgao_publico: string;
  nome_contrato: string;
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
  contratos?: Contrato | null;
}

export interface OrdemServicoInput {
  contrato_id: string;
  data_cadastro: string;
  cidade: string;
  estado: string;
  orgao_publico: string;
  nome_contrato: string;
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
