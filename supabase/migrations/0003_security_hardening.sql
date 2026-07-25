-- ============================================================================
-- HSM — Durcissement sécurité (suite aux advisors Supabase)
-- ============================================================================

-- La vue poll_results doit respecter la RLS de l'appelant, pas du créateur.
alter view public.poll_results set (security_invoker = on);

-- Fixer un search_path stable sur les fonctions (évite le détournement).
alter function public.profile_initials(text) set search_path = public, pg_temp;
alter function public.touch_updated_at()      set search_path = public, pg_temp;

-- handle_new_user est un trigger d'auth : ne doit pas être appelable en RPC.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
