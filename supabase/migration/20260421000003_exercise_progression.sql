-- ─── 1. esercizi.livello: fix constraint 1-6 → 1-20 ──────────────────────────
ALTER TABLE esercizi DROP CONSTRAINT IF EXISTS esercizi_livello_check;
ALTER TABLE esercizi ADD CONSTRAINT esercizi_livello_check CHECK (livello BETWEEN 1 AND 20);

-- ─── 2. esercizi: aggiunge colonna famiglia ───────────────────────────────────
-- Identifica il motore di gioco condiviso tra le varianti (es. 'sequence_tap').
-- Corrisponde al campo "game" nel JSON di configurazione.
ALTER TABLE esercizi ADD COLUMN IF NOT EXISTS famiglia TEXT;

-- ─── 3. sessioni: aggiunge livello giocato ────────────────────────────────────
-- Necessario per la logica adattiva: calcola accuratezza sugli ultimi 3 trial
-- della stessa tipologia cognitiva e promuove/retrocede il livello utente.
ALTER TABLE sessioni ADD COLUMN IF NOT EXISTS livello INTEGER;

-- ─── 4. esercizi_del_giorno: rifatta come tabella per-utente ─────────────────
-- Precedente struttura: globale, 1 esercizio al giorno (UNIQUE data).
-- Nuova struttura: per-utente, 5 esercizi al giorno (uno per categoria),
-- con tracking completamento e rispetto della regola di rotazione N.
DROP TABLE IF EXISTS esercizi_del_giorno;

CREATE TABLE esercizi_del_giorno (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  esercizio_id TEXT NOT NULL REFERENCES esercizi(id),
  categoria_id TEXT NOT NULL REFERENCES categorie(id),
  data         DATE NOT NULL DEFAULT CURRENT_DATE,
  completato   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, data, categoria_id)
);

ALTER TABLE esercizi_del_giorno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EserciziGiorno: read own"
  ON esercizi_del_giorno FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "EserciziGiorno: insert own"
  ON esercizi_del_giorno FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "EserciziGiorno: update own"
  ON esercizi_del_giorno FOR UPDATE USING (auth.uid() = user_id);

-- ─── 5. user_levels: livello corrente per utente per tipologia ───────────────
-- Una riga per ogni combinazione utente × categoria (5 righe per utente).
-- La progressione adattiva aggiorna livello_corrente dopo ogni sessione,
-- basandosi sull'accuratezza degli ultimi 3 trial della stessa tipologia:
--   > 80% → +1 livello  |  70-80% → invariato  |  < 70% → -1 livello
CREATE TABLE IF NOT EXISTS user_levels (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categoria_id     TEXT NOT NULL REFERENCES categorie(id),
  livello_corrente INTEGER NOT NULL DEFAULT 1,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, categoria_id),
  CHECK (livello_corrente BETWEEN 1 AND 20)
);

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UserLevels: read own"
  ON user_levels FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "UserLevels: insert own"
  ON user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "UserLevels: update own"
  ON user_levels FOR UPDATE USING (auth.uid() = user_id);
