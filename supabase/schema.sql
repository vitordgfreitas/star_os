-- ============================================================
-- Sistema de Gestão de Contratos de Aluguel para Licitações
-- Script SQL para o Supabase SQL Editor (instalação nova)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_os') THEN
    CREATE TYPE status_os AS ENUM ('Pendente', 'Em Andamento', 'Concluído');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_item') THEN
    CREATE TYPE status_item AS ENUM (
      'Pendente', 'Separado', 'Entregue', 'Concluído', 'Recolhido'
    );
  END IF;
END$$;

-- ============================================================
-- Tabela: contratos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contratos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orgao            TEXT NOT NULL,
  data_inicio      DATE NOT NULL,
  data_fim         DATE NOT NULL,
  numero_controle  TEXT NOT NULL,
  link_pdf_drive   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contratos_datas_validas CHECK (data_fim >= data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_contratos_orgao ON public.contratos (orgao);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON public.contratos (numero_controle);
CREATE INDEX IF NOT EXISTS idx_contratos_data_inicio ON public.contratos (data_inicio);

-- ============================================================
-- Tabela: ordens_servico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id         UUID NOT NULL REFERENCES public.contratos (id) ON DELETE RESTRICT,
  data_cadastro       DATE NOT NULL DEFAULT CURRENT_DATE,
  cidade              TEXT NOT NULL,
  estado              CHAR(2) NOT NULL,
  orgao_publico       TEXT NOT NULL,
  nome_contrato       TEXT NOT NULL,
  empresa_contratada  TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_ordens_servico_contrato_id ON public.ordens_servico (contrato_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON public.ordens_servico (status);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_inicio ON public.ordens_servico (data_inicio_evento);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_fim ON public.ordens_servico (data_fim_evento);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_orgao ON public.ordens_servico (orgao_publico);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_nome_contrato ON public.ordens_servico (nome_contrato);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_empresa ON public.ordens_servico (empresa_contratada);

-- ============================================================
-- Tabela: itens_os
-- ============================================================
CREATE TABLE IF NOT EXISTS public.itens_os (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id       UUID NOT NULL REFERENCES public.ordens_servico (id) ON DELETE CASCADE,
  nome_item   TEXT NOT NULL,
  quantidade  INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  status_item status_item NOT NULL DEFAULT 'Pendente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_os_os_id ON public.itens_os (os_id);
CREATE INDEX IF NOT EXISTS idx_itens_os_status ON public.itens_os (status_item);

-- ============================================================
-- Trigger updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contratos_updated_at ON public.contratos;
CREATE TRIGGER trg_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ordens_servico_updated_at ON public.ordens_servico;
CREATE TRIGGER trg_ordens_servico_updated_at
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS — leitura pública; escrita via app (senha no middleware)
-- ============================================================
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_os ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública contratos" ON public.contratos;
CREATE POLICY "Leitura pública contratos" ON public.contratos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escrita contratos" ON public.contratos;
CREATE POLICY "Escrita contratos" ON public.contratos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualização contratos" ON public.contratos;
CREATE POLICY "Atualização contratos" ON public.contratos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Exclusão contratos" ON public.contratos;
CREATE POLICY "Exclusão contratos" ON public.contratos FOR DELETE USING (true);

DROP POLICY IF EXISTS "Leitura pública ordens_servico" ON public.ordens_servico;
CREATE POLICY "Leitura pública ordens_servico" ON public.ordens_servico FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escrita ordens_servico" ON public.ordens_servico;
CREATE POLICY "Escrita ordens_servico" ON public.ordens_servico FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualização ordens_servico" ON public.ordens_servico;
CREATE POLICY "Atualização ordens_servico" ON public.ordens_servico FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Exclusão ordens_servico" ON public.ordens_servico;
CREATE POLICY "Exclusão ordens_servico" ON public.ordens_servico FOR DELETE USING (true);

DROP POLICY IF EXISTS "Leitura pública itens_os" ON public.itens_os;
CREATE POLICY "Leitura pública itens_os" ON public.itens_os FOR SELECT USING (true);
DROP POLICY IF EXISTS "Escrita itens_os" ON public.itens_os;
CREATE POLICY "Escrita itens_os" ON public.itens_os FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualização itens_os" ON public.itens_os;
CREATE POLICY "Atualização itens_os" ON public.itens_os FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Exclusão itens_os" ON public.itens_os;
CREATE POLICY "Exclusão itens_os" ON public.itens_os FOR DELETE USING (true);

-- ============================================================
-- View resumo
-- ============================================================
DROP VIEW IF EXISTS public.v_ordens_resumo;

CREATE VIEW public.v_ordens_resumo
WITH (security_invoker = true)
AS
SELECT
  os.*,
  c.orgao AS contrato_orgao,
  c.numero_controle AS contrato_numero,
  COUNT(i.id) AS total_itens,
  COALESCE(SUM(i.quantidade), 0) AS total_quantidade_itens
FROM public.ordens_servico os
LEFT JOIN public.contratos c ON c.id = os.contrato_id
LEFT JOIN public.itens_os i ON i.os_id = os.id
GROUP BY os.id, c.orgao, c.numero_controle;
