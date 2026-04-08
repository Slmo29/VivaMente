-- BrainTrainer — Schema DB V1
-- Eseguire su Supabase SQL Editor

-- Utenti senior
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefono text unique,
  email text unique,
  anno_nascita integer,
  orario_notifica time default '09:00',
  canale_notifica text default 'whatsapp', -- 'whatsapp' | 'sms' | 'email'
  consenso_notifiche boolean default false,
  created_at timestamptz default now()
);

-- Categorie esercizi
create table if not exists categorie (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  icona text not null,
  descrizione text,
  colore text
);

-- Esercizi
create table if not exists esercizi (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references categorie(id),
  titolo text not null,
  descrizione text,
  difficolta text default 'facile',
  durata_stimata integer,
  beneficio text,
  config jsonb,
  attivo boolean default true,
  created_at timestamptz default now()
);

-- Sessioni di esercizio completate
create table if not exists sessioni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  esercizio_id uuid references esercizi(id),
  score integer,
  durata integer,
  completato boolean default true,
  created_at timestamptz default now()
);

-- Medaglie definizione
create table if not exists medaglie (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descrizione text,
  icona text,
  tipo text,
  condizione jsonb,
  created_at timestamptz default now()
);

-- Medaglie utente
create table if not exists user_medaglie (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  medaglia_id uuid references medaglie(id),
  guadagnata_at timestamptz default now(),
  unique(user_id, medaglia_id)
);

-- Esercizio del giorno
create table if not exists esercizi_del_giorno (
  id uuid primary key default gen_random_uuid(),
  esercizio_id uuid references esercizi(id),
  data date unique default current_date
);

-- RLS Policies
alter table users enable row level security;
alter table sessioni enable row level security;
alter table user_medaglie enable row level security;

create policy "Users can read own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

create policy "Users can read own sessions" on sessioni
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on sessioni
  for insert with check (auth.uid() = user_id);

create policy "Users can read own medals" on user_medaglie
  for select using (auth.uid() = user_id);

-- Accesso pubblico in lettura per categorie, esercizi, medaglie, esercizio del giorno
create policy "Public read categorie" on categorie for select using (true);
create policy "Public read esercizi" on esercizi for select using (true);
create policy "Public read medaglie" on medaglie for select using (true);
create policy "Public read esercizi_del_giorno" on esercizi_del_giorno for select using (true);
alter table categorie enable row level security;
alter table esercizi enable row level security;
alter table medaglie enable row level security;
alter table esercizi_del_giorno enable row level security;
