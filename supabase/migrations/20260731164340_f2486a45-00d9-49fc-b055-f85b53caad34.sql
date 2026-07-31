-- 1) Restrict has_role so it can only answer about the calling user
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow checks about the currently authenticated user.
  -- Privileged server-side code (service_role) may check any user.
  IF current_setting('role', true) <> 'service_role'
     AND (auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid()) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public._notify_call(text, jsonb) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public._notify_new_subscriber() FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public._notify_book_order_paid() FROM authenticated, anon;

-- 2) Replace always-true INSERT policies with validated ones
DROP POLICY IF EXISTS "Anyone can create book orders" ON public.pedidos_libros;
CREATE POLICY "Anyone can create book orders"
ON public.pedidos_libros FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(nombre_completo)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 5 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(telefono)) BETWEEN 5 AND 40
  AND length(btrim(libro)) BETWEEN 1 AND 200
  AND length(btrim(formato)) BETWEEN 1 AND 50
  AND cantidad BETWEEN 1 AND 100
  AND precio_unitario BETWEEN 0 AND 100000000
  AND subtotal BETWEEN 0 AND 100000000
  AND flete BETWEEN 0 AND 100000000
  AND total BETWEEN 0 AND 100000000
  AND estado_pago = 'pendiente'
  AND length(COALESCE(direccion, '')) <= 500
  AND length(COALESCE(ciudad, '')) <= 120
  AND length(COALESCE(departamento, '')) <= 120
);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(email)) BETWEEN 5 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);