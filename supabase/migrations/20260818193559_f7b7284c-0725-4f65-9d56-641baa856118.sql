DROP POLICY IF EXISTS "Anyone can refresh their newsletter data" ON public.suscriptores_newsletter;

REVOKE UPDATE ON public.suscriptores_newsletter FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.subscribe_newsletter(
  p_nombre text,
  p_email text,
  p_empresa text DEFAULT NULL,
  p_rol text DEFAULT NULL,
  p_intereses text[] DEFAULT '{}'::text[],
  p_source text DEFAULT 'suscribete'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_empresa text := nullif(btrim(coalesce(p_empresa, '')), '');
  v_rol text := nullif(btrim(coalesce(p_rol, '')), '');
  v_intereses text[] := coalesce(p_intereses, '{}'::text[]);
BEGIN
  IF length(v_nombre) < 1 OR length(v_nombre) > 200 THEN
    RAISE EXCEPTION 'invalid_nombre';
  END IF;
  IF length(v_email) < 5 OR length(v_email) > 320
     OR v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF length(coalesce(v_empresa, '')) > 200 OR length(coalesce(v_rol, '')) > 100 THEN
    RAISE EXCEPTION 'invalid_length';
  END IF;
  IF coalesce(array_length(v_intereses, 1), 0) > 20 THEN
    RAISE EXCEPTION 'invalid_intereses';
  END IF;

  INSERT INTO public.suscriptores_newsletter
    (nombre, email, empresa, rol, intereses, consentimiento, source)
  VALUES
    (v_nombre, v_email, v_empresa, v_rol, v_intereses, true,
     coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'suscribete'))
  ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    empresa = EXCLUDED.empresa,
    rol = EXCLUDED.rol,
    intereses = EXCLUDED.intereses,
    consentimiento = true,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(text, text, text, text, text[], text) FROM public;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text, text, text, text, text[], text) TO anon, authenticated, service_role;