-- Link da OS no Drive (na ordem de serviço, não no contrato) + observações
ALTER TABLE public.contratos DROP COLUMN IF EXISTS link_os_drive;

ALTER TABLE public.ordens_servico
  ADD COLUMN IF NOT EXISTS link_drive_os TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS observacoes TEXT;
