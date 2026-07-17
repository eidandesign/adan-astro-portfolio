-- Cotizaciones guardadas para links cortos (/cotizador/ver?id=...).
--
-- Cómo aplicarlo: Supabase → tu proyecto → SQL Editor → pega esto → Run.
-- Usa las mismas SUPABASE_URL y service_role key que cotizador-comentarios.sql
-- (Settings → API). Ver api/quotes.js.
--
-- RLS queda activo y SIN policies a propósito: la tabla solo se toca desde
-- api/quotes.js con el service_role key, que salta RLS. Así el anon key no
-- puede leer ni escribir cotizaciones aunque alguien lo tenga.

create table if not exists public.cotizador_quotes (
  -- Slug corto derivado del número de cotización y el nombre del cliente
  -- (quoteSlug() en src/lib/cotizador.js), p.ej. "nfb-2026-001-juan-perez".
  id         text primary key,
  numero     text,
  cliente    text,
  data       jsonb       not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cotizador_quotes enable row level security;
