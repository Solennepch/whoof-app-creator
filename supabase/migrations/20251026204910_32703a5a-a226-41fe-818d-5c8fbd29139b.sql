-- Correction des problèmes de sécurité (fonctions uniquement)

-- 1. Fixer set_timestamps : ajouter search_path
create or replace function public.set_timestamps()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = coalesce(new.created_at, now());
    new.updated_at = now();
  else
    new.updated_at = now();
  end if;
  return new;
end $$;

-- 2. Fixer update_updated_at_column : ajouter search_path
create or replace function public.update_updated_at_column()
returns trigger language plpgsql
set search_path = public
as $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;