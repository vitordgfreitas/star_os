-- ============================================================
-- Migração: nome_contrato + status_item
-- Execute no SQL Editor do Supabase (banco já existente)
-- ============================================================

-- Enum de status do item
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_item') THEN
    CREATE TYPE status_item AS ENUM (
      'Pendente',
      'Separado',
      'Entregue',
      'Concluído',
      'Recolhido'
    );
  END IF;
END$$;

-- 1. Nome do Contrato na OS
ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS nome_contrato TEXT;

UPDATE public.ordens_servico
SET nome_contrato = orgao_publico
WHERE nome_contrato IS NULL OR TRIM(nome_contrato) = '';

ALTER TABLE public.ordens_servico
  ALTER COLUMN nome_contrato SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ordens_servico_nome_contrato
  ON public.ordens_servico (nome_contrato);

-- 2. Status do Item
ALTER TABLE public.itens_os
  ADD COLUMN IF NOT EXISTS status_item status_item;

UPDATE public.itens_os
SET status_item = 'Pendente'
WHERE status_item IS NULL;

ALTER TABLE public.itens_os
  ALTER COLUMN status_item SET DEFAULT 'Pendente';

ALTER TABLE public.itens_os
  ALTER COLUMN status_item SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_itens_os_status
  ON public.itens_os (status_item);

-- Recria view (DROP obrigatório ao mudar colunas da tabela base)
DROP VIEW IF EXISTS public.v_ordens_resumo;

CREATE VIEW public.v_ordens_resumo
WITH (security_invoker = true)
AS
SELECT
  os.*,
  COUNT(i.id) AS total_itens,
  COALESCE(SUM(i.quantidade), 0) AS total_quantidade_itens
FROM public.ordens_servico os
LEFT JOIN public.itens_os i ON i.os_id = os.id
GROUP BY os.id;
