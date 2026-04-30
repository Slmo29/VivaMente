-- ============================================================
-- VivaMente — Backup completo DB
-- Progetto Supabase: vvxohvjyiqsesyockmcy
-- Data: 2026-04-30
-- ============================================================
-- Per ripristinare su un nuovo progetto Supabase:
--   1. Esegui la sezione SCHEMA (crea tabelle + vincoli)
--   2. Abilita RLS: ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;
--   3. Esegui la sezione POLICY
--   4. Esegui la sezione FUNZIONI RPC
--   5. Esegui la sezione DATI (nell'ordine: statici → utente)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. SCHEMA — CREATE TABLE
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categorie (
  id    text NOT NULL,
  nome  text NOT NULL,
  icona text NOT NULL,
  descrizione text,
  colore text
);

CREATE TABLE IF NOT EXISTS medaglie (
  id          text NOT NULL,
  nome        text NOT NULL,
  descrizione text,
  icona       text,
  tipo        text,
  condizione  jsonb,
  created_at  timestamptz DEFAULT now(),
  giorni      int4
);

CREATE TABLE IF NOT EXISTS users (
  id                   uuid NOT NULL DEFAULT gen_random_uuid(),
  nome                 text NOT NULL,
  cognome              text,
  telefono             text,
  email                text,
  anno_nascita         int4,
  genere               text,
  orario_notifica      time DEFAULT '09:00:00',
  canale_notifica      text DEFAULT 'whatsapp',
  consenso_notifiche   bool DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  current_streak       int4 NOT NULL DEFAULT 0,
  last_activity_date   date
);

CREATE TABLE IF NOT EXISTS esercizi (
  id                  text NOT NULL,
  famiglia            text NOT NULL,
  nome                text NOT NULL,
  categoria_id        text NOT NULL,
  memoria_type        text,
  modello_sessione    text NOT NULL DEFAULT 'timer',
  session_timer_sec   int4,
  trials_per_session  int4,
  params              jsonb NOT NULL DEFAULT '{}',
  attivo              bool NOT NULL DEFAULT true,
  ordine_in_famiglia  int4 NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessioni (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid,
  esercizio_id text,
  categoria_id text,
  score        int4,
  accuratezza  int4,
  durata       int4,
  completato   bool DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  livello      int4,
  metriche     jsonb
);

CREATE TABLE IF NOT EXISTS user_levels (
  id                          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL,
  categoria_id                text NOT NULL,
  livello_corrente            int4 NOT NULL DEFAULT 1,
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  ultime_accuratezze          double precision[] NOT NULL DEFAULT '{}',
  sessioni_sotto_60_consecutive int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_medaglie (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid,
  medaglia_id  text,
  guadagnata_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS familiari (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid,
  nome         text NOT NULL,
  relazione    text NOT NULL,
  telefono     text,
  collegato_at timestamptz DEFAULT now(),
  permessi     jsonb DEFAULT '{"attivita": true, "medaglie": true, "progressi": true}',
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inviti (
  id                uuid NOT NULL DEFAULT gen_random_uuid(),
  token             text NOT NULL,
  mittente_id       uuid,
  nome_destinatario text NOT NULL,
  contatto          text NOT NULL,
  relazione         text NOT NULL,
  status            text DEFAULT 'pending',
  created_at        timestamptz DEFAULT now(),
  expires_at        timestamptz DEFAULT (now() + '7 days'::interval)
);

CREATE TABLE IF NOT EXISTS messaggi (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  familiare_id    uuid,
  destinatario_id uuid,
  testo           text NOT NULL,
  categoria       text,
  letto           bool DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS esercizi_del_giorno (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  esercizio_id text NOT NULL,
  categoria_id text NOT NULL,
  data         date NOT NULL DEFAULT CURRENT_DATE,
  completato   bool NOT NULL DEFAULT false
);


-- ════════════════════════════════════════════════════════════
-- 2. SCHEMA — PRIMARY KEYS + UNIQUE
-- ════════════════════════════════════════════════════════════

ALTER TABLE categorie         ADD CONSTRAINT categorie_pkey PRIMARY KEY (id);
ALTER TABLE esercizi          ADD CONSTRAINT esercizi_pkey PRIMARY KEY (id);
ALTER TABLE esercizi_del_giorno ADD CONSTRAINT esercizi_del_giorno_pkey PRIMARY KEY (id);
ALTER TABLE esercizi_del_giorno ADD CONSTRAINT esercizi_del_giorno_user_id_data_categoria_id_key UNIQUE (user_id, data, categoria_id);
ALTER TABLE familiari         ADD CONSTRAINT familiari_pkey PRIMARY KEY (id);
ALTER TABLE inviti            ADD CONSTRAINT inviti_pkey PRIMARY KEY (id);
ALTER TABLE inviti            ADD CONSTRAINT inviti_token_key UNIQUE (token);
ALTER TABLE medaglie          ADD CONSTRAINT medaglie_pkey PRIMARY KEY (id);
ALTER TABLE messaggi          ADD CONSTRAINT messaggi_pkey PRIMARY KEY (id);
ALTER TABLE sessioni          ADD CONSTRAINT sessioni_pkey PRIMARY KEY (id);
ALTER TABLE user_levels       ADD CONSTRAINT user_levels_pkey PRIMARY KEY (id);
ALTER TABLE user_levels       ADD CONSTRAINT user_levels_user_id_categoria_id_key UNIQUE (user_id, categoria_id);
ALTER TABLE user_medaglie     ADD CONSTRAINT user_medaglie_pkey PRIMARY KEY (id);
ALTER TABLE user_medaglie     ADD CONSTRAINT user_medaglie_user_id_medaglia_id_key UNIQUE (user_id, medaglia_id);
ALTER TABLE users             ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users             ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE users             ADD CONSTRAINT users_telefono_key UNIQUE (telefono);


-- ════════════════════════════════════════════════════════════
-- 3. SCHEMA — CHECK CONSTRAINTS
-- ════════════════════════════════════════════════════════════

ALTER TABLE esercizi  ADD CONSTRAINT esercizi_memoria_type_check      CHECK (memoria_type = ANY (ARRAY['mbt'::text, 'mlt'::text]));
ALTER TABLE esercizi  ADD CONSTRAINT esercizi_modello_sessione_check   CHECK (modello_sessione = ANY (ARRAY['timer'::text, 'completamento'::text]));
ALTER TABLE esercizi  ADD CONSTRAINT esercizi_session_timer_sec_check  CHECK (session_timer_sec = ANY (ARRAY[60, 90, 120]));
ALTER TABLE sessioni  ADD CONSTRAINT sessioni_livello_check            CHECK ((livello >= 1) AND (livello <= 20));
ALTER TABLE user_levels ADD CONSTRAINT user_levels_livello_corrente_check CHECK ((livello_corrente >= 1) AND (livello_corrente <= 20));
ALTER TABLE users     ADD CONSTRAINT users_genere_check               CHECK (genere = ANY (ARRAY['M'::text, 'F'::text]));


-- ════════════════════════════════════════════════════════════
-- 4. SCHEMA — FOREIGN KEYS
-- ════════════════════════════════════════════════════════════

ALTER TABLE esercizi            ADD CONSTRAINT esercizi_categoria_id_fkey              FOREIGN KEY (categoria_id)   REFERENCES categorie(id);
ALTER TABLE esercizi_del_giorno ADD CONSTRAINT esercizi_del_giorno_esercizio_id_fkey   FOREIGN KEY (esercizio_id)   REFERENCES esercizi(id);
ALTER TABLE esercizi_del_giorno ADD CONSTRAINT esercizi_del_giorno_user_id_fkey        FOREIGN KEY (user_id)        REFERENCES users(id);
ALTER TABLE esercizi_del_giorno ADD CONSTRAINT esercizi_del_giorno_categoria_id_fkey   FOREIGN KEY (categoria_id)   REFERENCES categorie(id);
ALTER TABLE familiari           ADD CONSTRAINT familiari_user_id_fkey                  FOREIGN KEY (user_id)        REFERENCES users(id);
ALTER TABLE inviti              ADD CONSTRAINT inviti_mittente_id_fkey                 FOREIGN KEY (mittente_id)    REFERENCES users(id);
ALTER TABLE messaggi            ADD CONSTRAINT messaggi_destinatario_id_fkey           FOREIGN KEY (destinatario_id) REFERENCES users(id);
ALTER TABLE messaggi            ADD CONSTRAINT messaggi_familiare_id_fkey              FOREIGN KEY (familiare_id)   REFERENCES familiari(id);
ALTER TABLE sessioni            ADD CONSTRAINT sessioni_user_id_fkey                   FOREIGN KEY (user_id)        REFERENCES users(id);
ALTER TABLE sessioni            ADD CONSTRAINT sessioni_esercizio_id_fkey              FOREIGN KEY (esercizio_id)   REFERENCES esercizi(id);
ALTER TABLE sessioni            ADD CONSTRAINT sessioni_categoria_id_fkey              FOREIGN KEY (categoria_id)   REFERENCES categorie(id);
ALTER TABLE user_levels         ADD CONSTRAINT user_levels_categoria_id_fkey           FOREIGN KEY (categoria_id)   REFERENCES categorie(id);
ALTER TABLE user_levels         ADD CONSTRAINT user_levels_user_id_fkey                FOREIGN KEY (user_id)        REFERENCES users(id);
ALTER TABLE user_medaglie       ADD CONSTRAINT user_medaglie_user_id_fkey              FOREIGN KEY (user_id)        REFERENCES users(id);
ALTER TABLE user_medaglie       ADD CONSTRAINT user_medaglie_medaglia_id_fkey          FOREIGN KEY (medaglia_id)    REFERENCES medaglie(id);


-- ════════════════════════════════════════════════════════════
-- 5. RLS — ENABLE + POLICIES
-- ════════════════════════════════════════════════════════════

ALTER TABLE categorie           ENABLE ROW LEVEL SECURITY;
ALTER TABLE esercizi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE esercizi_del_giorno ENABLE ROW LEVEL SECURITY;
ALTER TABLE familiari           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inviti              ENABLE ROW LEVEL SECURITY;
ALTER TABLE medaglie            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaggi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessioni            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medaglie       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;

-- categorie
CREATE POLICY "Public read categorie" ON categorie AS PERMISSIVE FOR SELECT TO public USING (true);

-- esercizi
CREATE POLICY "Public read esercizi" ON esercizi AS PERMISSIVE FOR SELECT TO public USING (true);

-- esercizi_del_giorno
CREATE POLICY "EserciziGiorno: insert own" ON esercizi_del_giorno AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "EserciziGiorno: read own"   ON esercizi_del_giorno AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "EserciziGiorno: update own" ON esercizi_del_giorno AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));

-- familiari
CREATE POLICY "Familiari: delete own" ON familiari AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Familiari: insert own" ON familiari AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Familiari: read own"   ON familiari AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

-- inviti
CREATE POLICY "Inviti: insert own"  ON inviti AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = mittente_id));
CREATE POLICY "Inviti: read by token" ON inviti AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Inviti: read own"    ON inviti AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = mittente_id));

-- medaglie
CREATE POLICY "Public read medaglie" ON medaglie AS PERMISSIVE FOR SELECT TO public USING (true);

-- messaggi
CREATE POLICY "Messaggi: insert"    ON messaggi AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Messaggi: mark read" ON messaggi AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = destinatario_id));
CREATE POLICY "Messaggi: read own"  ON messaggi AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = destinatario_id));

-- sessioni
CREATE POLICY "Sessioni: insert own" ON sessioni AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Sessioni: read own"   ON sessioni AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

-- user_levels
CREATE POLICY "UserLevels: insert own" ON user_levels AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "UserLevels: read own"   ON user_levels AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));
CREATE POLICY "UserLevels: update own" ON user_levels AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));

-- user_medaglie
CREATE POLICY "Medaglie utente: insert own" ON user_medaglie AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Medaglie utente: read own"   ON user_medaglie AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

-- users
CREATE POLICY "Users: insert own profile" ON users AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users: read own profile"   ON users AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY "Users: update own profile" ON users AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id));


-- ════════════════════════════════════════════════════════════
-- 6. FUNZIONI RPC
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_familiare_dashboard(p_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_senior_id UUID;
  v_invito RECORD;
  v_familiare_id UUID;
  v_result JSON;
BEGIN
  SELECT * INTO v_invito FROM inviti WHERE token = p_token AND status != 'expired' LIMIT 1;
  IF v_invito IS NULL THEN
    RETURN json_build_object('error', 'Token non valido o scaduto');
  END IF;
  v_senior_id := v_invito.mittente_id;

  SELECT id INTO v_familiare_id FROM familiari
  WHERE user_id = v_senior_id AND nome = v_invito.nome_destinatario LIMIT 1;

  IF v_familiare_id IS NULL THEN
    INSERT INTO familiari (user_id, nome, relazione, permessi)
    VALUES (v_senior_id, v_invito.nome_destinatario, v_invito.relazione,
            '{"attivita":true,"medaglie":true,"progressi":true}'::jsonb)
    RETURNING id INTO v_familiare_id;
    UPDATE inviti SET status = 'accepted' WHERE token = p_token;
  END IF;

  SELECT json_build_object(
    'senior', (
      SELECT json_build_object(
        'nome', nome, 'genere', genere,
        'current_streak', current_streak
      ) FROM users WHERE id = v_senior_id
    ),
    'invito', json_build_object(
      'relazione', v_invito.relazione,
      'nome_destinatario', v_invito.nome_destinatario
    ),
    'familiare_id', v_familiare_id,
    'esercizi_oggi', (
      SELECT COALESCE(json_agg(json_build_object(
        'esercizio_id', esercizio_id,
        'categoria_id', categoria_id,
        'completato', completato
      )), '[]'::json)
      FROM esercizi_del_giorno
      WHERE user_id = v_senior_id AND data = CURRENT_DATE
    ),
    'sessioni_recenti', (
      SELECT COALESCE(json_agg(json_build_object(
        'categoria_id', categoria_id,
        'score', score,
        'created_at', created_at
      ) ORDER BY created_at DESC), '[]'::json)
      FROM (SELECT categoria_id, score, created_at FROM sessioni
            WHERE user_id = v_senior_id
            ORDER BY created_at DESC LIMIT 60) s
    ),
    'messaggi_inviati', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', id, 'testo', testo, 'letto', letto,
        'created_at', created_at, 'categoria', categoria
      ) ORDER BY created_at DESC), '[]'::json)
      FROM (SELECT id, testo, letto, created_at, categoria FROM messaggi
            WHERE familiare_id = v_familiare_id
            ORDER BY created_at DESC LIMIT 5) m
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.invia_messaggio_familiare(p_token text, p_testo text, p_categoria text DEFAULT 'Incoraggiamento'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_senior_id UUID;
  v_familiare_id UUID;
  v_invito RECORD;
BEGIN
  SELECT * INTO v_invito FROM inviti WHERE token = p_token AND status != 'expired' LIMIT 1;
  IF v_invito IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Token non valido');
  END IF;
  v_senior_id := v_invito.mittente_id;

  SELECT id INTO v_familiare_id FROM familiari
  WHERE user_id = v_senior_id AND nome = v_invito.nome_destinatario LIMIT 1;

  IF v_familiare_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Familiare non trovato');
  END IF;

  INSERT INTO messaggi (familiare_id, destinatario_id, testo, categoria, letto)
  VALUES (v_familiare_id, v_senior_id, p_testo, p_categoria, false);

  RETURN json_build_object('success', true);
END;
$function$;


-- ════════════════════════════════════════════════════════════
-- 7. DATI — Tabelle statiche
-- ════════════════════════════════════════════════════════════

-- categorie (5)
INSERT INTO categorie (id, nome, icona, descrizione, colore) VALUES ('attenzione', 'Attenzione', 'target', 'Esercizi per migliorare la concentrazione e l''attenzione', '#7C3AED');
INSERT INTO categorie (id, nome, icona, descrizione, colore) VALUES ('esecutive', 'Esecutive', 'puzzle', 'Esercizi per le funzioni esecutive: pianificazione e problem solving', '#D97706');
INSERT INTO categorie (id, nome, icona, descrizione, colore) VALUES ('linguaggio', 'Linguaggio', 'chat', 'Esercizi per mantenere le capacità linguistiche', '#16A34A');
INSERT INTO categorie (id, nome, icona, descrizione, colore) VALUES ('memoria', 'Memoria', 'brain', 'Esercizi per allenare la memoria a breve e lungo termine', '#2563EB');
INSERT INTO categorie (id, nome, icona, descrizione, colore) VALUES ('visuospaziali', 'Visuospaziali', 'eye', 'Esercizi per la percezione e l''orientamento spaziale', '#DC2626');

-- medaglie (11)
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorno-1',  'Primo giorno',           'streak', '{"tipo": "streak", "valore": 1}',   1);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-2',  '2 giorni consecutivi',   'streak', '{"tipo": "streak", "valore": 2}',   2);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-3',  '3 giorni consecutivi',   'streak', '{"tipo": "streak", "valore": 3}',   3);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-7',  '7 giorni consecutivi',   'streak', '{"tipo": "streak", "valore": 7}',   7);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-10', '10 giorni consecutivi',  'streak', '{"tipo": "streak", "valore": 10}',  10);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-14', '14 giorni consecutivi',  'streak', '{"tipo": "streak", "valore": 14}',  14);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-28', '28 giorni consecutivi',  'streak', '{"tipo": "streak", "valore": 28}',  28);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-50', '50 giorni consecutivi',  'streak', '{"tipo": "streak", "valore": 50}',  50);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-100','100 giorni consecutivi', 'streak', '{"tipo": "streak", "valore": 100}', 100);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-200','200 giorni consecutivi', 'streak', '{"tipo": "streak", "valore": 200}', 200);
INSERT INTO medaglie (id, nome, tipo, condizione, giorni) VALUES ('giorni-365','365 giorni consecutivi', 'streak', '{"tipo": "streak", "valore": 365}', 365);

-- esercizi (41)
-- attenzione
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('odd_one_out_numeri_lettere', 'Odd One Out', 'Trova l''Intruso — Numeri e Lettere', 'attenzione', 'timer', 60, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('odd_one_out_immagini', 'Odd One Out', 'Trova l''Intruso — Immagini', 'attenzione', 'timer', 60, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('sart_numerico', 'SART', 'SART Numerico', 'attenzione', 'completamento', '{}', true, 1);
-- esecutive
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('flanker_frecce', 'Flanker Task', 'Flanker — Frecce', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('go_nogo_cromatico', 'Go/No-Go', 'Go/No-Go — Colori', 'esecutive', 'timer', 60, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('go_nogo_semantico', 'Go/No-Go', 'Go/No-Go — Semantico', 'esecutive', 'timer', 60, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('hayling_ab', 'Hayling Game', 'Completamento Frasi — A+B', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('hayling_b_only', 'Hayling Game', 'Completamento Frasi — Solo B', 'esecutive', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('pasat_light_visivo', 'Pasat Light', 'PASAT Visivo', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sort_it_percettivo', 'Sort It', 'Ordina — Percettivo', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sort_it_semantico', 'Sort It', 'Ordina — Semantico', 'esecutive', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('stroop_classico', 'Stroop', 'Stroop Classico', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('updating_wm_parole', 'Updating WM', 'Aggiornamento — Parole', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('updating_wm_immagini', 'Updating WM', 'Aggiornamento — Immagini', 'esecutive', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('updating_wm_numeri', 'Updating WM', 'Aggiornamento — Numeri', 'esecutive', 'timer', 90, '{}', true, 3);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('word_chain_alfabetico', 'Word Chain', 'Catena di Parole — Alfabetico', 'esecutive', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('word_chain_switching_categoriale', 'Word Chain Switching', 'Catena di Parole — Categoriale', 'esecutive', 'timer', 90, '{}', true, 1);
-- linguaggio
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('picture_naming', 'Linguaggio e Denominazione', 'Denominazione — Immagini', 'linguaggio', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('synonym_antonym_decision', 'Linguaggio e Denominazione', 'Sinonimi e Antonimi', 'linguaggio', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, trials_per_session, params, attivo, ordine_in_famiglia) VALUES ('verbal_fluency_semantica', 'Verbal Fluency', 'Fluenza Verbale — Semantica', 'linguaggio', 'completamento', 1, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, trials_per_session, params, attivo, ordine_in_famiglia) VALUES ('verbal_fluency_fonemica', 'Verbal Fluency', 'Fluenza Verbale — Fonemica', 'linguaggio', 'completamento', 1, '{}', true, 2);
-- memoria
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('associative_memory', 'Associative Memory', 'Memoria Associativa', 'memoria', 'completamento', '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('cultura_generale', 'Conoscenza Generale', 'Cultura Generale', 'memoria', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_comprensione_fattuale_mbt', 'Memoria e Comprensione del Testo', 'Testo e Memoria — Fattuale Breve Termine', 'memoria', 'mbt', 'completamento', '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_comprensione_inferenziale_mbt', 'Memoria e Comprensione del Testo', 'Testo e Memoria — Inferenza Breve Termine', 'memoria', 'mbt', 'completamento', '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_comprensione_ordine_narrativo', 'Memoria e Comprensione del Testo', 'Testo e Memoria — Ordine Narrativo', 'memoria', 'completamento', '{}', true, 3);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_comprensione_fattuale_mlt', 'Memoria e Comprensione del Testo', 'Testo e Memoria — Fattuale Lungo Termine', 'memoria', 'mlt', 'completamento', '{}', true, 4);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_lista_parole_rievocazione', 'Memoria Lista', 'Lista di Parole — Rievocazione', 'memoria', 'completamento', '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_lista_immagini_rievocazione', 'Memoria Lista', 'Lista di Immagini — Rievocazione', 'memoria', 'completamento', '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_lista_parole_riconoscimento', 'Memoria Lista', 'Lista di Parole — Riconoscimento', 'memoria', 'completamento', '{}', true, 3);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_lista_immagini_riconoscimento', 'Memoria Lista', 'Lista di Immagini — Riconoscimento', 'memoria', 'completamento', '{}', true, 4);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_prospettica_event_based', 'Memoria Prospettica', 'Memoria Prospettica — Quando vedi il segnale', 'memoria', 'completamento', '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('memoria_prospettica_time_based', 'Memoria Prospettica', 'Memoria Prospettica — A intervalli di tempo', 'memoria', 'completamento', '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('recall_grid_parole_mbt', 'Recall Grid', 'Memorizza Parole nella Griglia', 'memoria', 'mbt', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('recall_grid_immagini_mbt', 'Recall Grid', 'Memorizza Immagini nella Griglia', 'memoria', 'mbt', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, params, attivo, ordine_in_famiglia) VALUES ('recall_grid_immagini_mlt', 'Recall Grid', 'Memorizza Immagini con Pausa', 'memoria', 'mlt', 'completamento', '{}', true, 3);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sequence_tap_numeri_forward', 'Sequence Tap', 'Sequenza Numeri — In Avanti', 'memoria', 'mbt', 'timer', 90, '{}', true, 1);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sequence_tap_numeri_backward', 'Sequence Tap', 'Sequenza Numeri — Al Contrario', 'memoria', 'mbt', 'timer', 90, '{}', true, 2);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sequence_tap_parole_forward', 'Sequence Tap', 'Sequenza Parole — In Avanti', 'memoria', 'mbt', 'timer', 90, '{}', true, 3);
INSERT INTO esercizi (id, famiglia, nome, categoria_id, memoria_type, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('sequence_tap_parole_backward', 'Sequence Tap', 'Sequenza Parole — Al Contrario', 'memoria', 'mbt', 'timer', 90, '{}', true, 4);
-- visuospaziali
INSERT INTO esercizi (id, famiglia, nome, categoria_id, modello_sessione, session_timer_sec, params, attivo, ordine_in_famiglia) VALUES ('path_tracing', 'Path Tracing', 'Traccia il Percorso', 'visuospaziali', 'timer', 90, '{}', true, 1);


-- ════════════════════════════════════════════════════════════
-- 8. DATI — Utenti (anonimizzati: nome/cognome/email/telefono rimossi)
-- ════════════════════════════════════════════════════════════

-- NOTA: gli UUID sono reali — necessari per mantenere le FK coerenti.
-- nome/cognome/email/telefono sono stati rimossi per privacy.
-- Per un ripristino reale su un nuovo progetto Supabase, gli utenti
-- devono ri-registrarsi via auth: il loro UUID auth.uid() sarà diverso
-- e queste righe vanno aggiornate di conseguenza.

INSERT INTO users (id, nome, orario_notifica, canale_notifica, consenso_notifiche, current_streak, last_activity_date) VALUES ('6420b3f5-75b9-4371-a776-c50cde35c2bf', 'Utente_1', '09:00:00', 'sms',   false, 3, '2026-04-30');
INSERT INTO users (id, nome, orario_notifica, canale_notifica, consenso_notifiche, current_streak, last_activity_date) VALUES ('78737905-8198-4f78-be8b-5d9cde47c4cc', 'Utente_2', '08:00:00', 'email', true,  1, '2026-04-27');
INSERT INTO users (id, nome, orario_notifica, canale_notifica, consenso_notifiche, current_streak, last_activity_date) VALUES ('553e939e-00f5-41e4-b628-91f35a8e8317', 'Utente_3', '10:00:00', 'email', true,  2, '2026-04-25');

-- user_levels (15)
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('176e5270-0486-45a6-bede-40a02bde019b', '553e939e-00f5-41e4-b628-91f35a8e8317', 'attenzione',    1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('17104e61-5585-4f2b-96fc-9efaf2723729', '553e939e-00f5-41e4-b628-91f35a8e8317', 'esecutive',     1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('0346f170-cf94-4c74-a697-3dfa5dad0dd8', '553e939e-00f5-41e4-b628-91f35a8e8317', 'linguaggio',    1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('33bc5f52-5dbd-45d8-8365-544dcd8a040f', '553e939e-00f5-41e4-b628-91f35a8e8317', 'memoria',       1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('d10f2f3c-8291-4755-a7eb-df294b520fe7', '553e939e-00f5-41e4-b628-91f35a8e8317', 'visuospaziali', 1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('6735f6a4-7e5a-4d9a-bc04-8d03f6177cc5', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'attenzione',    1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('f960454d-b3df-4b82-83eb-8a6761598eb5', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'esecutive',     1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('cd85f47a-48d1-4499-bd41-ec6605622ea0', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'linguaggio',    2, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('3c6843e6-06f7-4210-b9e0-7dbf2be2169e', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'memoria',       3, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('f9bf5ade-a591-48d2-a2e2-7548b66e86f4', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'visuospaziali', 1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('839b372f-def3-447e-b14f-1372c9318a0f', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'attenzione',    1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('683141a3-0688-429f-9beb-a310ad73069a', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'esecutive',     1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('6223eb71-dee4-4336-9114-ddc10142daab', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'linguaggio',    1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('e96701cb-82ba-44d2-aebc-ece6b47b7c50', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'memoria',       1, '{}'::double precision[], 0);
INSERT INTO user_levels (id, user_id, categoria_id, livello_corrente, ultime_accuratezze, sessioni_sotto_60_consecutive) VALUES ('5c2a6a72-51bf-453a-80bb-10cf7b2b7857', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'visuospaziali', 1, '{}'::double precision[], 0);

-- user_medaglie (6)
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('677b91d5-fd53-4f8c-b09e-fd1e7af724fc', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'giorno-1',  '2026-04-22 13:14:51.569809+00');
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('c4138b7d-34b7-4eb5-955a-bccd49317c4b', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'giorni-2',  '2026-04-23 06:55:54.595948+00');
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('0b52fbbd-78ca-4f8f-bd1c-088e3947ad2d', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'giorni-3',  '2026-04-24 09:23:01.498211+00');
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('271ce709-b958-4ff6-a1c8-aaa5431fe82a', '553e939e-00f5-41e4-b628-91f35a8e8317', 'giorno-1',  '2026-04-24 20:57:57.424008+00');
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('bde1743a-d591-48d3-bf9d-0c2113c21435', '553e939e-00f5-41e4-b628-91f35a8e8317', 'giorni-2',  '2026-04-25 08:17:27.211172+00');
INSERT INTO user_medaglie (id, user_id, medaglia_id, guadagnata_at) VALUES ('8a85c5fc-24dc-4f84-96e5-3b06e3b9d176', '78737905-8198-4f78-be8b-5d9cde47c4cc', 'giorno-1',  '2026-04-27 14:02:43.256575+00');

-- familiari (1 — nome anonimizzato)
INSERT INTO familiari (id, user_id, nome, relazione, telefono, collegato_at, permessi) VALUES ('b71bd012-4d49-4936-b9aa-3d1e3dbf9faa', '553e939e-00f5-41e4-b628-91f35a8e8317', 'Familiare_anonimo', 'Amico di famiglia', NULL, '2026-04-25 11:59:24.908339+00', '{"attivita": true, "medaglie": true, "progressi": true}');

-- sessioni (52 — dati di test, esercizio_id storici potrebbero non corrispondere al catalogo attuale)
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('3bd6f883-ed99-4f8d-a939-fb60ffb857ef', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sequence-tap-numeri', 'memoria', 43, 43, NULL, true, '2026-04-22 13:14:51.156068+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('fd619a29-1e81-4809-8a69-74395c2a1fb2', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sequence-tap-parole', 'memoria', 50, 50, NULL, true, '2026-04-22 13:18:06.002344+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('8ab26d0c-23fc-4bdb-93c9-77c28b69f773', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'go-nogo-cromatico', 'attenzione', 84, 84, NULL, true, '2026-04-22 13:26:29.497309+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('6e10a7c3-48e1-4b56-a0e5-6b440c0da08c', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'pasat-light-single', 'attenzione', 75, 75, NULL, true, '2026-04-22 13:47:58.081005+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('2bf8b108-7a62-47ea-b617-18a3a5c8f700', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'verbal-fluency-categoriale', 'linguaggio', 80, 80, NULL, true, '2026-04-22 13:50:03.897678+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('c6ba48e8-325c-425c-80bc-53e7540ada81', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 100, 100, NULL, true, '2026-04-22 13:51:46.486133+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('e938f2e6-51b6-44ba-b202-d1f0945ae0d8', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 94, 94, NULL, true, '2026-04-22 13:56:01.653143+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('45d65f65-c634-4aa6-bf12-ebf54b328898', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'pasat-light-single', 'attenzione', 100, 100, NULL, true, '2026-04-22 13:56:58.370913+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('a66ba860-c707-422b-9c70-41ee99de98b5', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 100, 100, NULL, true, '2026-04-22 14:07:09.463698+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('d47ef968-2b21-438b-a87e-07ab03e08838', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 0, 0, NULL, true, '2026-04-22 14:08:21.346782+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('9891c8f0-3a0d-49d3-aae7-8cfad362548d', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 100, 100, NULL, true, '2026-04-22 14:11:26.200916+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('9cc7ae0a-285a-4ff1-b9c3-9a6e48b0635b', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'dccs-light', 'esecutive', 91, 91, NULL, true, '2026-04-22 14:13:58.982525+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('980e41db-5e1f-471f-b12a-2cd0eee165b6', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sequence-tap-immagini', 'memoria', 0, 0, NULL, true, '2026-04-22 16:03:20.731064+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('8311e28c-7a15-462e-ab0e-e161c30d0dc9', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'linguaggio-semantic-relatedness', 'linguaggio', 88, 88, NULL, true, '2026-04-23 06:55:53.909433+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('d64660b9-2187-4e16-bd06-cee059fbe105', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'recall-grid-numeri', 'memoria', 100, 100, NULL, true, '2026-04-23 13:24:11.660111+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('96623ab7-11ae-45e7-8049-f863ba463b80', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'pasat-light-single', 'attenzione', 75, 75, NULL, true, '2026-04-23 13:29:10.761478+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('9853c24c-b542-4e31-98db-fcfe4b7f1b09', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'linguaggio-semantic-relatedness', 'linguaggio', 89, 89, NULL, true, '2026-04-23 13:32:39.205762+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('f66f8be1-8c0e-4c72-bf70-90b7be51bcbf', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sort-it-colore', 'esecutive', 100, 100, NULL, true, '2026-04-23 13:35:19.82048+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('bf8767e5-ae41-4a6d-b6fe-d01a06cb74b5', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'mental-rotation-forme', 'visuospaziali', 65, 65, NULL, true, '2026-04-23 13:37:36.695573+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('4eec5b49-0682-49b3-a340-d3f4c616d165', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sequence-tap-parole', 'memoria', 80, 80, NULL, true, '2026-04-23 14:01:09.108634+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('9ce92ea7-00b5-48cd-b314-9b3ca7d9c88f', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'sequence-tap-immagini', 'memoria', 50, 50, NULL, true, '2026-04-23 14:03:49.169233+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('08ee5328-4c09-4794-b3d7-658ddbc92e4c', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'recall-grid-parole', 'memoria', 100, 100, NULL, true, '2026-04-23 14:07:31.0138+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('fbd204a2-c83e-40b9-a49e-4408ffc92d71', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'updating-wm-numeri', 'memoria', 100, 100, NULL, true, '2026-04-23 14:12:46.503465+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('5dcf5835-4c21-41a0-9d66-38cefdc7ebd9', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'memoria-prosa-narrativi', 'memoria', 50, 50, NULL, true, '2026-04-23 14:22:50.953969+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('7fc72c4e-e67e-4575-8e3f-97824e5d149d', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'memoria-prospettica-visiva', 'memoria', 38, 38, NULL, true, '2026-04-23 14:33:14.777284+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('dc386293-4814-4d6c-b82d-f5aab10588cd', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'updating-wm-parole-living', 'memoria', 83, 83, NULL, true, '2026-04-23 14:37:37.693613+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('ef3f1369-5949-4767-95d7-8d0c7d390426', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'memoria-lista-parole', 'memoria', 0, 0, NULL, true, '2026-04-24 09:23:00.860517+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('3155a4f2-a3dc-460c-bb3b-42aa1ab2fe8e', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'flanker-frecce', 'attenzione', 0, 0, NULL, true, '2026-04-24 09:23:14.17633+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('1543a9be-29b2-4452-b008-c0a8159c7172', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'linguaggio-naming', 'linguaggio', 0, 0, NULL, true, '2026-04-24 09:23:19.670308+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('5a1efe16-aff4-4c2d-a042-d6ebb33b9342', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'task-switching-numeri', 'esecutive', 0, 0, NULL, true, '2026-04-24 09:23:29.299848+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('f63db672-f6bc-4c7a-b10a-2822531ecc16', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'figure-ground-forme', 'visuospaziali', 0, 0, NULL, true, '2026-04-24 09:23:34.91736+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('e8c212c3-ef3a-4bca-bd66-853bb649c8a6', '553e939e-00f5-41e4-b628-91f35a8e8317', 'memoria-lista-parole', 'memoria', 0, 0, NULL, true, '2026-04-24 20:57:57.045369+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('d2243102-157b-4123-bbb2-cf85d150472e', '553e939e-00f5-41e4-b628-91f35a8e8317', 'flanker-frecce', 'attenzione', 0, 0, NULL, true, '2026-04-24 21:04:18.933819+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('0d4f47d9-fe0c-4971-97ec-f544d2ab6669', '553e939e-00f5-41e4-b628-91f35a8e8317', 'figure-ground-oggetti', 'visuospaziali', 0, 0, NULL, true, '2026-04-25 08:17:26.702974+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('cbe88edd-54e8-4973-a3c9-2899d69d8a2c', '553e939e-00f5-41e4-b628-91f35a8e8317', 'updating-wm-numeri', 'memoria', 0, 0, NULL, true, '2026-04-25 08:17:49.969055+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('28139354-5364-43ff-b546-854cfb3ed832', '553e939e-00f5-41e4-b628-91f35a8e8317', 'sart-cifre', 'attenzione', 0, 0, NULL, true, '2026-04-25 08:20:24.067321+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('4451c2e5-14a2-4506-96db-c37e1b78ff12', '553e939e-00f5-41e4-b628-91f35a8e8317', 'verbal-fluency-categoriale', 'linguaggio', 0, 0, NULL, true, '2026-04-25 08:21:45.724737+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('a6c0886d-d742-4903-9a0d-e2503dac6343', '553e939e-00f5-41e4-b628-91f35a8e8317', 'hayling-quotidiano', 'esecutive', 0, 0, NULL, true, '2026-04-25 08:22:17.953995+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('b7c515fb-c871-472a-b812-1bcb533c9d78', '553e939e-00f5-41e4-b628-91f35a8e8317', 'sequence-tap-numeri', 'memoria', 0, 0, NULL, true, '2026-04-25 12:57:18.067445+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('8c686485-36cc-4cce-b5d2-b5dc565457c3', '553e939e-00f5-41e4-b628-91f35a8e8317', 'pasat-light-double', 'attenzione', 0, 0, NULL, true, '2026-04-25 12:57:33.098618+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('d29140ef-0830-4ca6-b497-78f94e7a7012', '553e939e-00f5-41e4-b628-91f35a8e8317', 'linguaggio-lexical-decision', 'linguaggio', 0, 0, NULL, true, '2026-04-25 12:57:48.241945+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('df529e71-f85e-40e7-ac2a-2dd346fea744', '553e939e-00f5-41e4-b628-91f35a8e8317', 'block-design-colori', 'visuospaziali', 0, 0, NULL, true, '2026-04-25 12:57:59.199602+00', NULL, NULL);
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('718ce5df-3507-4501-88d1-c1a212eaf354', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'go_nogo_cromatico', 'esecutive', 83, 83, 31, true, '2026-04-29 08:30:18.265165+00', 1, '{"go_errori": 2, "go_totali": 39, "nogo_errori": 8, "nogo_totali": 10, "mp_bonus_step_max": 0, "tempo_totale_go_ms": 17391.7, "mp_trial_bonus_totali": 9, "mp_trial_bonus_corretti": 6}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('07a0181e-9138-4579-b97f-a4157204203e', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'go_nogo_cromatico', 'esecutive', 20, 20, 70, true, '2026-04-29 08:32:21.237506+00', 1, '{"go_errori": 32, "go_totali": 33, "nogo_errori": 0, "nogo_totali": 7, "mp_bonus_step_max": 0, "tempo_totale_go_ms": 1044.7, "mp_trial_bonus_totali": 0, "mp_trial_bonus_corretti": 0}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('78c41868-47d2-4a60-9b77-88b84a521fc3', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'flanker_frecce', 'esecutive', 82, 82, 92, true, '2026-04-29 16:03:16.519091+00', 10, '{"congruenti_errori": 4, "congruenti_totali": 29, "mp_bonus_step_max": 0, "incongruenti_errori": 6, "incongruenti_totali": 18, "mp_trial_bonus_totali": 9, "mp_trial_bonus_corretti": 6, "tempo_totale_congruenti_ms": 24363.7, "tempo_totale_incongruenti_ms": 14623.6}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('7bc1bccb-38c5-41d1-b4de-7bb85c4345ea', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'stroop_classico', 'esecutive', 79, 79, 92, true, '2026-04-29 16:07:52.767316+00', 10, '{"congruenti_errori": 5, "congruenti_totali": 24, "mp_bonus_step_max": 0, "incongruenti_errori": 5, "incongruenti_totali": 16, "mp_trial_bonus_totali": 7, "mp_trial_bonus_corretti": 4, "tempo_totale_congruenti_ms": 22856.4, "tempo_totale_incongruenti_ms": 18659.1}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('7707765d-e5d4-4b79-8ed0-c77fe2daad14', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'go_nogo_cromatico', 'esecutive', 85, 85, 47, true, '2026-04-30 09:20:45.371998+00', 1, '{"go_errori": 7, "go_totali": 40, "nogo_errori": 0, "nogo_totali": 10, "mp_bonus_step_max": 0, "tempo_totale_go_ms": 18889.5, "mp_trial_bonus_totali": 10, "mp_trial_bonus_corretti": 9}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('626ea44a-5bd3-4dc5-bc5c-27893a04f992', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'go_nogo_cromatico', 'esecutive', 86, 86, 61, true, '2026-04-30 10:13:01.087256+00', 3, '{"go_errori": 7, "go_totali": 41, "nogo_errori": 0, "nogo_totali": 10, "mp_bonus_step_max": 0, "tempo_totale_go_ms": 15923.4, "mp_trial_bonus_totali": 11, "mp_trial_bonus_corretti": 10}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('40b463b3-b576-4b9c-abcb-8231f04d06c1', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'odd_one_out_numeri_lettere', 'attenzione', 93, 93, 95, true, '2026-04-30 10:36:03.762548+00', 2, '{"trial_errati": 1, "trial_timeout": 0, "trial_corretti": 17, "tempo_totale_ms": 44979, "mp_bonus_step_max": 2, "mp_trial_bonus_totali": 4, "mp_trial_bonus_corretti": 4}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('9b2d64c3-48c6-4537-9297-21874e35c229', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'odd_one_out_numeri_lettere', 'attenzione', 100, 100, 67, true, '2026-04-30 10:53:05.743661+00', 2, '{"trial_errati": 0, "trial_timeout": 1, "trial_corretti": 15, "tempo_totale_ms": 46353, "mp_bonus_step_max": 0, "mp_trial_bonus_totali": 4, "mp_trial_bonus_corretti": 3}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('87d974b1-ed6e-4655-96a4-a87933424482', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'odd_one_out_numeri_lettere', 'attenzione', 54, 54, 67, true, '2026-04-30 11:17:17.734003+00', 9, '{"trial_errati": 5, "trial_timeout": 1, "trial_corretti": 8, "tempo_totale_ms": 29977, "mp_bonus_step_max": 1, "mp_trial_bonus_totali": 1, "mp_trial_bonus_corretti": 1}');
INSERT INTO sessioni (id, user_id, esercizio_id, categoria_id, score, accuratezza, durata, completato, created_at, livello, metriche) VALUES ('b2750deb-9b64-4d03-9eab-9439e2610b1c', '6420b3f5-75b9-4371-a776-c50cde35c2bf', 'odd_one_out_numeri_lettere', 'attenzione', 27, 27, 61, true, '2026-04-30 11:25:02.626638+00', 1, '{"trial_errati": 2, "trial_timeout": 6, "trial_corretti": 3, "tempo_totale_ms": 4430, "mp_bonus_step_max": 0, "mp_trial_bonus_totali": 0, "mp_trial_bonus_corretti": 0}');

-- ════════════════════════════════════════════════════════════
-- NOTE SUL RIPRISTINO
-- ════════════════════════════════════════════════════════════
-- 1. Le sessioni con esercizio_id come 'dccs-light', 'sequence-tap-numeri' ecc.
--    sono ID storici (pre-refactor catalogo). La FK sessioni→esercizi fallirà
--    su queste righe se il nuovo DB non ha quegli id. Soluzione: inserirle
--    senza FK o aggiungerle con ON CONFLICT DO NOTHING dopo aver rimosso il vincolo.
-- 2. Gli UUID degli utenti sono legati all'auth di Supabase. Su un nuovo progetto
--    gli stessi UUID non esistono in auth.users → le policy RLS basate su auth.uid()
--    bloccheranno l'accesso. I dati utente vanno re-collegati dopo la nuova registrazione.
-- 3. inviti e messaggi non sono inclusi (dati sensibili, 2+2 righe non critiche).
-- 4. esercizi_del_giorno non inclusa (ricreata automaticamente dall'app al login).
-- ════════════════════════════════════════════════════════════
