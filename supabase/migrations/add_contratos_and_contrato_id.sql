-- ============================================================
-- Migração: tabela contratos + contrato_id em ordens_servico
-- Execute no SQL Editor do Supabase (banco já existente)
-- ============================================================

-- Enum status_item (caso ainda não exista)
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

DROP TRIGGER IF EXISTS trg_contratos_updated_at ON public.contratos;
CREATE TRIGGER trg_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- status_item em itens_os (caso ainda não exista)
-- ============================================================
ALTER TABLE public.itens_os
  ADD COLUMN IF NOT EXISTS status_item status_item;

UPDATE public.itens_os SET status_item = 'Pendente' WHERE status_item IS NULL;

ALTER TABLE public.itens_os
  ALTER COLUMN status_item SET DEFAULT 'Pendente';

ALTER TABLE public.itens_os
  ALTER COLUMN status_item SET NOT NULL;

-- ============================================================
-- contrato_id em ordens_servico
-- ============================================================
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS contrato_id UUID REFERENCES public.contratos (id) ON DELETE RESTRICT;

-- Migra dados existentes: 1 contrato por OS
DO $$
DECLARE
  r RECORD;
  novo_contrato_id UUID;
BEGIN
  FOR r IN
    SELECT id, orgao_publico, nome_contrato, data_inicio_evento, data_fim_evento
    FROM public.ordens_servico
    WHERE contrato_id IS NULL
  LOOP
    INSERT INTO public.contratos (orgao, data_inicio, data_fim, numero_controle)
    VALUES (
      r.orgao_publico,
      r.data_inicio_evento,
      r.data_fim_evento,
      COALESCE(NULLIF(TRIM(r.nome_contrato), ''), r.orgao_publico)
    )
    RETURNING id INTO novo_contrato_id;

    UPDATE public.ordens_servico
    SET contrato_id = novo_contrato_id
    WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.ordens_servico
  ALTER COLUMN contrato_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ordens_servico_contrato_id ON public.ordens_servico (contrato_id);

-- ============================================================
-- RLS — leitura pública (Visualizar), escrita liberada via anon
-- (proteção de escrita feita no app via senha + middleware)
-- ============================================================
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública contratos" ON public.contratos;
CREATE POLICY "Leitura pública contratos"
  ON public.contratos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserção contratos" ON public.contratos;
CREATE POLICY "Inserção contratos"
  ON public.contratos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Atualização contratos" ON public.contratos;
CREATE POLICY "Atualização contratos"
  ON public.contratos FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Exclusão contratos" ON public.contratos;
CREATE POLICY "Exclusão contratos"
  ON public.contratos FOR DELETE USING (true);

-- Recria view
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
