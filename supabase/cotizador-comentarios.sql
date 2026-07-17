-- Comentarios de clientes sobre una cotización (/cotizador/ver).
--
-- Cómo aplicarlo: Supabase → tu proyecto → SQL Editor → pega esto → Run.
-- Después copia SUPABASE_URL y el service_role key (Settings → API) a las
-- variables de entorno del proyecto en Vercel. Ver api/comentarios.js.
--
-- RLS queda activo y SIN policies a propósito: la tabla solo se toca desde
-- api/comentarios.js con el service_role key, que salta RLS. Así el anon key
-- no puede leer ni escribir comentarios aunque alguien lo tenga.

create table if not exists public.cotizador_comentarios (
  id          bigint generated always as identity primary key,
  -- data.id de la cotización (genId() en src/lib/cotizador.js). La cotización
  -- vive en el hash del link, no en la base: esto solo amarra el hilo.
  quote_id    text        not null,
  -- Copias para poder identificar el hilo desde la base sin decodificar el
  -- link (la cotización puede editarse después de enviarse).
  quote_numero text,
  cliente     text,
  autor       text        not null default '',
  texto       text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists cotizador_comentarios_quote_idx
  on public.cotizador_comentarios (quote_id, created_at);

alter table public.cotizador_comentarios enable row level security;
