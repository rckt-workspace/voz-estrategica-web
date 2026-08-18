CREATE TABLE public.suscriptores_newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  empresa text,
  rol text,
  intereses text[] NOT NULL DEFAULT '{}'::text[],
  consentimiento boolean NOT NULL DEFAULT true,
  source text DEFAULT 'suscribete',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE ON public.suscriptores_newsletter TO anon, authenticated;
GRANT SELECT ON public.suscriptores_newsletter TO authenticated;
GRANT ALL ON public.suscriptores_newsletter TO service_role;

ALTER TABLE public.suscriptores_newsletter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
ON public.suscriptores_newsletter FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(nombre)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 5 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(coalesce(empresa, '')) <= 200
  AND length(coalesce(rol, '')) <= 100
  AND coalesce(array_length(intereses, 1), 0) <= 20
  AND consentimiento = true
);

CREATE POLICY "Anyone can refresh their newsletter data"
ON public.suscriptores_newsletter FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (
  length(btrim(nombre)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 5 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(coalesce(empresa, '')) <= 200
  AND length(coalesce(rol, '')) <= 100
  AND coalesce(array_length(intereses, 1), 0) <= 20
  AND consentimiento = true
);

CREATE POLICY "Admins can read newsletter subscribers"
ON public.suscriptores_newsletter FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER suscriptores_newsletter_updated_at
BEFORE UPDATE ON public.suscriptores_newsletter
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();