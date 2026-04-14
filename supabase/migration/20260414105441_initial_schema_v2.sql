-- ─── Utenti senior ───────────────────────────────────────────────────────────
create table if not exists users (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  cognome          text,
  telefono         text unique,
  email            text unique,
  anno_nascita     integer,
  genere           text check (genere in ('M', 'F')),
  orario_notifica  time default '09:00',
  canale_notifica  text default 'whatsapp',
  consenso_notifiche boolean default false,
  created_at       timestamptz default now()
);

-- ─── Categorie esercizi ───────────────────────────────────────────────────────
create table if not exists categorie (
  id          text primary key,
  nome        text not null,
  icona       text not null,
  descrizione text,
  colore      text
);

-- ─── Esercizi ────────────────────────────────────────────────────────────────
create table if not exists esercizi (
  id              text primary key,
  categoria_id    text references categorie(id),
  titolo          text not null,
  descrizione     text,
  livello         integer not null default 1 check (livello between 1 and 6),
  difficolta      text default 'facile',
  durata_stimata  integer,
  beneficio       text,
  config          jsonb,
  attivo          boolean default true,
  created_at      timestamptz default now()
);

-- ─── Sessioni di esercizio completate ────────────────────────────────────────
create table if not exists sessioni (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  esercizio_id text references esercizi(id),
  categoria_id text references categorie(id),
  score        integer,
  accuratezza  integer,
  durata       integer,
  completato   boolean default true,
  created_at   timestamptz default now()
);

-- ─── Medaglie definizione ─────────────────────────────────────────────────────
create table if not exists medaglie (
  id          text primary key,
  nome        text not null,
  descrizione text,
  icona       text,
  tipo        text,
  condizione  jsonb,
  created_at  timestamptz default now()
);

-- ─── Medaglie utente ──────────────────────────────────────────────────────────
create table if not exists user_medaglie (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  medaglia_id  text references medaglie(id),
  guadagnata_at timestamptz default now(),
  unique(user_id, medaglia_id)
);

-- ─── Esercizio del giorno ─────────────────────────────────────────────────────
create table if not exists esercizi_del_giorno (
  id           uuid primary key default gen_random_uuid(),
  esercizio_id text references esercizi(id),
  data         date unique default current_date
);

-- ─── Familiari collegati ──────────────────────────────────────────────────────
create table if not exists familiari (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  nome         text not null,
  relazione    text not null,
  telefono     text,
  collegato_at timestamptz default now(),
  permessi     jsonb default '{"attivita": true, "medaglie": true, "progressi": true}'::jsonb,
  created_at   timestamptz default now()
);

-- ─── Inviti familiari ─────────────────────────────────────────────────────────
create table if not exists inviti (
  id                  uuid primary key default gen_random_uuid(),
  token               text unique not null,
  mittente_id         uuid references users(id) on delete cascade,
  nome_destinatario   text not null,
  contatto            text not null,
  relazione           text not null,
  status              text default 'pending',
  created_at          timestamptz default now(),
  expires_at          timestamptz default (now() + interval '7 days')
);

-- ─── Messaggi familiari ───────────────────────────────────────────────────────
create table if not exists messaggi (
  id              uuid primary key default gen_random_uuid(),
  familiare_id    uuid references familiari(id) on delete cascade,
  destinatario_id uuid references users(id) on delete cascade,
  testo           text not null,
  categoria       text,
  letto           boolean default false,
  created_at      timestamptz default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table users              enable row level security;
alter table categorie          enable row level security;
alter table esercizi           enable row level security;
alter table sessioni           enable row level security;
alter table medaglie           enable row level security;
alter table user_medaglie      enable row level security;
alter table esercizi_del_giorno enable row level security;
alter table familiari          enable row level security;
alter table inviti             enable row level security;
alter table messaggi           enable row level security;

-- users
create policy "Users: read own profile"   on users for select using (auth.uid() = id);
create policy "Users: update own profile" on users for update using (auth.uid() = id);
create policy "Users: insert own profile" on users for insert with check (auth.uid() = id);

-- sessioni
create policy "Sessioni: read own"   on sessioni for select using (auth.uid() = user_id);
create policy "Sessioni: insert own" on sessioni for insert with check (auth.uid() = user_id);

-- user_medaglie
create policy "Medaglie utente: read own" on user_medaglie for select using (auth.uid() = user_id);

-- familiari
create policy "Familiari: read own"   on familiari for select using (auth.uid() = user_id);
create policy "Familiari: insert own" on familiari for insert with check (auth.uid() = user_id);
create policy "Familiari: delete own" on familiari for delete using (auth.uid() = user_id);

-- inviti
create policy "Inviti: read own"      on inviti for select using (auth.uid() = mittente_id);
create policy "Inviti: insert own"    on inviti for insert with check (auth.uid() = mittente_id);
create policy "Inviti: read by token" on inviti for select using (true);

-- messaggi
create policy "Messaggi: read own"  on messaggi for select using (auth.uid() = destinatario_id);
create policy "Messaggi: insert"    on messaggi for insert with check (true);
create policy "Messaggi: mark read" on messaggi for update using (auth.uid() = destinatario_id);

-- lettura pubblica dati statici
create policy "Public read categorie"           on categorie           for select using (true);
create policy "Public read esercizi"            on esercizi            for select using (true);
create policy "Public read medaglie"            on medaglie            for select using (true);
create policy "Public read esercizi_del_giorno" on esercizi_del_giorno for select using (true);
