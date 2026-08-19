CREATE OR REPLACE FUNCTION public.confirm_book_order(p_order_id text, p_estado text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.pedidos_libros;
  v_estado text;
BEGIN
  IF p_order_id IS NULL OR p_order_id !~ '^LIBRO-[a-z-]+-[0-9]{10,16}-[a-f0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_order_id';
  END IF;

  v_estado := lower(coalesce(p_estado, ''));
  IF v_estado NOT IN ('aprobado', 'rechazado', 'pendiente') THEN
    RAISE EXCEPTION 'invalid_estado';
  END IF;

  SELECT * INTO v_row FROM public.pedidos_libros WHERE bold_order_id = p_order_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Nunca degradar un pedido ya aprobado ni reabrir uno cancelado
  IF v_row.estado_pago IN ('aprobado', 'cancelado') THEN
    RETURN to_jsonb(v_row);
  END IF;

  IF v_row.estado_pago <> v_estado THEN
    UPDATE public.pedidos_libros
      SET estado_pago = v_estado
      WHERE id = v_row.id
      RETURNING * INTO v_row;
  END IF;

  RETURN to_jsonb(v_row);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_book_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_book_order(text, text) TO anon, authenticated, service_role;