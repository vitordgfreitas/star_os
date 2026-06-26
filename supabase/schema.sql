-- ============================================================
-- Sistema de Gestão de Contratos de Aluguel para Licitações
-- Script SQL para o Supabase SQL Editor
-- Copie e cole este arquivo inteiro no painel do Supabase
-- ============================================================

-- Extensão para UUIDs (já habilitada por padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum de status da Ordem de Serviço
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_os') THEN
    CREATE TYPE status_os AS ENUM ('Pendente', 'Em Andamento', 'Concluído');
  END IF;
END$$;

-- ============================================================
-- Tabela: ordens_servico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_cadastro       DATE NOT NULL DEFAULT CURRENT_DATE,
  cidade              TEXT NOT NULL,
  estado              CHAR(2) NOT NULL,
  orgao_publico       TEXT NOT NULL,
  endereco            TEXT NOT NULL,
  valor_total         NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  data_inicio_evento  DATE NOT NULL,
  data_fim_evento     DATE NOT NULL,
  status              status_os NOT NULL DEFAULT 'Pendente',
  nota_emitida        BOOLEAN NOT NULL DEFAULT FALSE,
  link_drive_nota     TEXT,
  pagamento_recebido  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT datas_evento_validas CHECK (data_fim_evento >= data_inicio_evento)
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON public.ordens_servico (status);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_inicio ON public.ordens_servico (data_inicio_evento);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_fim ON public.ordens_servico (data_fim_evento);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_orgao ON public.ordens_servico (orgao_publico);

-- ============================================================
-- Tabela: itens_os (1:N com ordens_servico)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.itens_os (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id       UUID NOT NULL REFERENCES public.ordens_servico (id) ON DELETE CASCADE,
  nome_item   TEXT NOT NULL,
  quantidade  INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_os_os_id ON public.itens_os (os_id);

-- ============================================================
-- Trigger: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ordens_servico_updated_at ON public.ordens_servico;
CREATE TRIGGER trg_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_os ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para uso interno/familiar (sem autenticação)
-- IMPORTANTE: Para produção com múltiplos usuários, substitua por políticas
-- baseadas em auth.uid() após configurar Supabase Auth.

DROP POLICY IF EXISTS "Permitir leitura de ordens_servico" ON public.ordens_servico;
CREATE POLICY "Permitir leitura de ordens_servico"
  ON public.ordens_servico FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção de ordens_servico" ON public.ordens_servico;
CREATE POLICY "Permitir inserção de ordens_servico"
  ON public.ordens_servico FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de ordens_servico" ON public.ordens_servico;
CREATE POLICY "Permitir atualização de ordens_servico"
  ON public.ordens_servico FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de ordens_servico" ON public.ordens_servico;
CREATE POLICY "Permitir exclusão de ordens_servico"
  ON public.ordens_servico FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Permitir leitura de itens_os" ON public.itens_os;
CREATE POLICY "Permitir leitura de itens_os"
  ON public.itens_os FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção de itens_os" ON public.itens_os;
CREATE POLICY "Permitir inserção de itens_os"
  ON public.itens_os FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de itens_os" ON public.itens_os;
CREATE POLICY "Permitir atualização de itens_os"
  ON public.itens_os FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de itens_os" ON public.itens_os;
CREATE POLICY "Permitir exclusão de itens_os"
  ON public.itens_os FOR DELETE
  USING (true);

-- ============================================================
-- View auxiliar: ordens com contagem de itens (opcional)
-- ============================================================
CREATE OR REPLACE VIEW public.v_ordens_resumo
WITH (security_invoker = true)
AS
SELECT
  os.*,
  COUNT(i.id) AS total_itens,
  COALESCE(SUM(i.quantidade), 0) AS total_quantidade_itens
FROM public.ordens_servico os
LEFT JOIN public.itens_os i ON i.os_id = os.id
GROUP BY os.id;
