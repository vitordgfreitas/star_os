-- ============================================================
-- Migração: adicionar empresa_contratada
-- Execute no SQL Editor do Supabase se o banco já existia
-- antes desta atualização.
-- ============================================================

ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS empresa_contratada TEXT;

UPDATE public.ordens_servico
SET empresa_contratada = 'Não informada'
WHERE empresa_contratada IS NULL OR empresa_contratada = '';

ALTER TABLE public.ordens_servico
  ALTER COLUMN empresa_contratada SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ordens_servico_empresa
  ON public.ordens_servico (empresa_contratada);

-- Recria a view (DROP obrigatório quando a tabela ganha colunas novas)
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
