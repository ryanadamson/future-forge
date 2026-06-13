REVOKE SELECT (contact) ON public.tutoring_posts FROM authenticated;
REVOKE SELECT (contact) ON public.tutoring_posts FROM anon;
GRANT SELECT (contact) ON public.tutoring_posts TO service_role;