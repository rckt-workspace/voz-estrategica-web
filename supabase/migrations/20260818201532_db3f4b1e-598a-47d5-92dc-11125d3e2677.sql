ALTER TABLE public.suscriptores_newsletter ADD COLUMN IF NOT EXISTS telefono text;

CREATE OR REPLACE FUNCTION public.subscribe_newsletter(p_nombre text, p_email text, p_empresa text DEFAULT NULL::text, p_rol text DEFAULT NULL::text, p_intereses text[] DEFAULT '{}'::text[], p_source text DEFAULT 'suscribete'::text, p_telefono text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_empresa text := nullif(btrim(coalesce(p_empresa, '')), '');
  v_rol text := nullif(btrim(coalesce(p_rol, '')), '');
  v_telefono text := nullif(btrim(coalesce(p_telefono, '')), '');
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
  IF length(coalesce(v_telefono, '')) > 40 THEN
    RAISE EXCEPTION 'invalid_telefono';
  END IF;
  IF coalesce(array_length(v_intereses, 1), 0) > 20 THEN
    RAISE EXCEPTION 'invalid_intereses';
  END IF;

  INSERT INTO public.suscriptores_newsletter
    (nombre, email, empresa, rol, telefono, intereses, consentimiento, source)
  VALUES
    (v_nombre, v_email, v_empresa, v_rol, v_telefono, v_intereses, true,
     coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'suscribete'))
  ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    empresa = EXCLUDED.empresa,
    rol = EXCLUDED.rol,
    telefono = coalesce(EXCLUDED.telefono, public.suscriptores_newsletter.telefono),
    intereses = EXCLUDED.intereses,
    consentimiento = true,
    updated_at = now();
END;
$function$;