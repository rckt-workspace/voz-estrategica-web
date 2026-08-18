GRANT SELECT, INSERT, UPDATE ON public.pedidos_libros TO authenticated;
GRANT INSERT ON public.pedidos_libros TO anon;
GRANT ALL ON public.pedidos_libros TO service_role;