REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Orders: make it explicit that nobody can create orders from the browser.
-- All order creation happens server-side with the privileged service role.
REVOKE ALL ON TABLE public.orders FROM anon;
REVOKE ALL ON TABLE public.orders FROM authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
DROP POLICY IF EXISTS "No client inserts on orders" ON public.orders;
CREATE POLICY "No client inserts on orders"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (false);