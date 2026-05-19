-- Tighten public verification log writes to avoid an always-true policy
DROP POLICY IF EXISTS "verif insert public" ON public.verification_logs;

CREATE POLICY "verif insert public" ON public.verification_logs
FOR INSERT TO public
WITH CHECK (
  lot_number IS NOT NULL
  AND length(trim(lot_number)) BETWEEN 1 AND 128
  AND (lookup_ip IS NULL OR length(trim(lookup_ip)) BETWEEN 1 AND 128)
);