CREATE TABLE public.leads_mx (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  empresa text NOT NULL,
  cargo text,
  tipo_evento text NOT NULL,
  ciudad_fecha text NOT NULL,
  whatsapp text NOT NULL,
  presupuesto text,
  asistentes text,
  gclid text,
  utm_source text,
  utm_campaign text,
  landing text NOT NULL DEFAULT '/mx/diego-camacho',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads_mx TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads_mx TO authenticated;
GRANT ALL ON public.leads_mx TO service_role;

ALTER TABLE public.leads_mx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede crear leads mx"
  ON public.leads_mx FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(nombre)) > 0
    AND length(btrim(empresa)) > 0
    AND length(btrim(whatsapp)) > 0
    AND length(nombre) <= 200
    AND length(empresa) <= 200
    AND length(coalesce(cargo, '')) <= 200
    AND length(ciudad_fecha) <= 300
  );

CREATE POLICY "Admins ven leads mx"
  ON public.leads_mx FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins actualizan leads mx"
  ON public.leads_mx FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins eliminan leads mx"
  ON public.leads_mx FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_leads_mx_updated_at
  BEFORE UPDATE ON public.leads_mx
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();