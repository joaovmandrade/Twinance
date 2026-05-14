-- ============================================================
-- Twinance — Supabase Schema
-- Run this entire file in the Supabase SQL editor
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name       text        NOT NULL DEFAULT '',
  email      text,
  created_at timestamptz DEFAULT now()
);

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Couples ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.couples (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code text        NOT NULL UNIQUE,
  created_at  timestamptz DEFAULT now()
);

-- ── Couple members ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.couple_members (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users  ON DELETE CASCADE NOT NULL,
  couple_id  uuid REFERENCES public.couples ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)          -- each user belongs to at most one couple
);

-- ── Categories ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       text NOT NULL,
  name       text NOT NULL,
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,  -- NULL = system category
  created_at timestamptz DEFAULT now(),
  UNIQUE (slug, user_id)
);

-- Seed default (system) categories
INSERT INTO public.categories (slug, name, user_id) VALUES
  ('food',          'Alimentação',  NULL),
  ('transport',     'Transporte',   NULL),
  ('health',        'Saúde',        NULL),
  ('entertainment', 'Lazer',        NULL),
  ('home',          'Casa',         NULL),
  ('shopping',      'Compras',      NULL),
  ('education',     'Educação',     NULL),
  ('travel',        'Viagem',       NULL),
  ('pets',          'Pet',          NULL),
  ('other',         'Outros',       NULL)
ON CONFLICT (slug, user_id) DO NOTHING;

-- ── Expenses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users     ON DELETE CASCADE NOT NULL,
  couple_id    uuid        REFERENCES public.couples ON DELETE CASCADE NOT NULL,
  amount       numeric(12,2) NOT NULL,
  category_id  uuid        REFERENCES public.categories ON DELETE SET NULL,
  description  text        NOT NULL DEFAULT '',
  is_recurring boolean     NOT NULL DEFAULT false,
  date         date        NOT NULL DEFAULT CURRENT_DATE,
  created_at   timestamptz DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_couple_members_user_id   ON public.couple_members (user_id);
CREATE INDEX IF NOT EXISTS idx_couple_members_couple_id ON public.couple_members (couple_id);
CREATE INDEX IF NOT EXISTS idx_expenses_couple_id       ON public.expenses (couple_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id         ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date            ON public.expenses (date DESC);
