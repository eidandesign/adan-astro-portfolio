-- Solicitudes de cotización de la landing de No Flag Brand (/noflagbrand).
--
-- Cómo aplicarlo: Supabase → tu proyecto → SQL Editor → pega esto → Run.
-- Usa las mismas SUPABASE_URL y service_role key que las tablas del
-- cotizador. Ver api/nfb-lead.js.
--
-- RLS queda activo y SIN policies a propósito: la tabla solo se toca desde
-- api/nfb-lead.js con el service_role key, que salta RLS. Así el anon key
-- no puede leer ni escribir leads aunque alguien lo tenga.

create table if not exists public.nfb_leads (
  id          bigint generated always as identity primary key,
  nombre      text        not null,
  empresa     text,
  email       text        not null,
  telefono    text,
  servicios   text[]      not null default '{}',
  presupuesto text,
  -- El formulario completo tal como llegó (proyecto, problema, referencias,
  -- tiempos, origen, etc.) — así el esquema no se rompe si la landing cambia.
  datos       jsonb       not null,
  created_at  timestamptz not null default now()
);

alter table public.nfb_leads enable row level security;
