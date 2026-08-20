REVOKE ALL ON FUNCTION public.subscribe_newsletter(text, text, text, text, text[], text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text, text, text, text, text[], text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_book_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_book_order(text, text) TO anon, authenticated;