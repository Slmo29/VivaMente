-- ─── Categorie ────────────────────────────────────────────────────────────────
insert into categorie (id, nome, icona, descrizione, colore) values
  ('memoria',       'Memoria',        'brain',       'Esercizi per allenare la memoria a breve e lungo termine',           '#2563EB'),
  ('attenzione',    'Attenzione',     'target',      'Esercizi per migliorare la concentrazione e l''attenzione',          '#7C3AED'),
  ('linguaggio',    'Linguaggio',     'chat',        'Esercizi per mantenere le capacità linguistiche',                    '#16A34A'),
  ('esecutive',     'Esecutive',      'puzzle',      'Esercizi per le funzioni esecutive: pianificazione e problem solving','#D97706'),
  ('visuospaziali', 'Visuospaziali',  'eye',         'Esercizi per la percezione e l''orientamento spaziale',              '#DC2626')
on conflict do nothing;

-- ─── Esercizi Memoria ────────────────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, descrizione, livello, difficolta, durata_stimata, beneficio, config) values
  ('memoria-parole-1', 'memoria', 'Ricorda le Parole', 'Memorizza le parole e poi riordinale', 1, 'facile', 90,
   'Stimola la memoria di lavoro e la capacità di richiamare informazioni',
   '{"tipo": "memoria_parole", "parole": ["CASA", "LUNA", "PANE", "FIORE"], "tempo_visualizzazione": 5, "tempo_risposta": 30}'),
  ('memoria-colori-1', 'memoria', 'Sequenza di Colori', 'Ripeti la sequenza di colori nell''ordine giusto', 1, 'facile', 60,
   'Allena la memoria sequenziale e il coordinamento visivo-motorio',
   '{"tipo": "sequenza_colori", "lunghezza_sequenza": 4, "tempo_per_colore": 800}'),
  ('memoria-parole-2', 'memoria', 'Ricorda le Parole (Medio)', 'Memorizza più parole in meno tempo', 3, 'medio', 90,
   'Potenzia la memoria di lavoro con sfide crescenti',
   '{"tipo": "memoria_parole", "parole": ["MARE", "SOLE", "LIBRO", "ALBERO", "GATTO"], "tempo_visualizzazione": 4, "tempo_risposta": 25}'),
  ('memoria-colori-2', 'memoria', 'Sequenza Lunga', 'Ripeti una sequenza più lunga di colori', 3, 'medio', 90,
   'Migliora la capacità di memorizzazione sequenziale',
   '{"tipo": "sequenza_colori", "lunghezza_sequenza": 6, "tempo_per_colore": 700}'),
  ('memoria-parole-3', 'memoria', 'Ricorda le Parole (Difficile)', 'Sette parole da ricordare in poco tempo', 5, 'difficile', 120,
   'Massima stimolazione della memoria di lavoro',
   '{"tipo": "memoria_parole", "parole": ["MONTAGNA", "FARFALLA", "CAPPELLO", "FINESTRA", "BICICLETTA", "CANDELA", "PONTE"], "tempo_visualizzazione": 4, "tempo_risposta": 20}')
on conflict do nothing;

-- ─── Esercizi Attenzione ──────────────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, descrizione, livello, difficolta, durata_stimata, beneficio, config) values
  ('attenzione-differenze-1', 'attenzione', 'Trova le Differenze', 'Trova le 5 differenze tra le due immagini', 1, 'facile', 60,
   'Allena la concentrazione e la percezione visiva del dettaglio',
   '{"tipo": "trova_differenze", "differenze": 5, "tempo": 60}'),
  ('attenzione-stroop-1', 'attenzione', 'Test Stroop', 'Di che colore è scritto questo testo?', 3, 'medio', 60,
   'Potenzia il controllo cognitivo e l''inibizione delle risposte automatiche',
   '{"tipo": "stroop", "domande": 10, "tempo_per_domanda": 4}'),
  ('attenzione-differenze-2', 'attenzione', 'Trova le Differenze (Difficile)', 'Trova le differenze in meno tempo', 5, 'difficile', 60,
   'Massima stimolazione dell''attenzione visiva',
   '{"tipo": "trova_differenze", "differenze": 7, "tempo": 45}'),
  ('attenzione-reazione-1', 'attenzione', 'Reazione Visiva', 'Tocca solo i cerchi del colore richiesto', 2, 'facile', 60,
   'Migliora i tempi di reazione e la selezione visiva',
   '{"tipo": "reazione_visiva", "durata": 30, "colore_target": "blu"}'),
  ('attenzione-stroop-2', 'attenzione', 'Stroop Avanzato', 'Test Stroop con più domande e meno tempo', 5, 'difficile', 60,
   'Massima stimolazione del controllo cognitivo',
   '{"tipo": "stroop", "domande": 15, "tempo_per_domanda": 3}')
on conflict do nothing;

-- ─── Esercizi Linguaggio ──────────────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, descrizione, livello, difficolta, durata_stimata, beneficio, config) values
  ('linguaggio-anagramma-1', 'linguaggio', 'Anagramma', 'Ricomponi le parole mischiate', 1, 'facile', 45,
   'Stimola le capacità linguistiche e il pensiero flessibile',
   '{"tipo": "anagramma", "parole": ["AMORE", "TAVOLO", "GIARDINO"], "suggerimento": true, "tempo": 45}'),
  ('linguaggio-completa-1', 'linguaggio', 'Completa la Parola', 'Completa le parole con le lettere mancanti', 1, 'facile', 30,
   'Mantiene il vocabolario attivo e la memoria delle parole',
   '{"tipo": "completa_parola", "parole": ["CA__", "F__RE", "LU__"], "soluzioni": ["CASA", "FIORE", "LUNA"]}'),
  ('linguaggio-anagramma-2', 'linguaggio', 'Anagramma Difficile', 'Parole più lunghe da ricomporre', 3, 'medio', 60,
   'Potenzia le capacità linguistiche con sfide più complesse',
   '{"tipo": "anagramma", "parole": ["BIBLIOTECA", "FARFALLA", "CAMPAGNA"], "suggerimento": false, "tempo": 60}'),
  ('linguaggio-frasi-1', 'linguaggio', 'Completa le Frasi', 'Trova la parola che completa la frase', 3, 'medio', 45,
   'Stimola la comprensione semantica e il ragionamento linguistico',
   '{"tipo": "completa_parola", "parole": ["Il gatto beve il __TTE", "La notte è __URA", "Il sole è CA__DO"], "soluzioni": ["LATTE", "SCURA", "CALDO"]}'),
  ('linguaggio-anagramma-3', 'linguaggio', 'Anagramma Esperto', 'Parole molto complesse', 5, 'difficile', 90,
   'Massima stimolazione delle capacità linguistiche',
   '{"tipo": "anagramma", "parole": ["RIVOLUZIONE", "MERAVIGLIOSO", "AVVENTURA"], "suggerimento": false, "tempo": 45}')
on conflict do nothing;

-- ─── Esercizi Funzioni Esecutive ──────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, descrizione, livello, difficolta, durata_stimata, beneficio, config) values
  ('esecutive-torre-1', 'esecutive', 'Torre di Hanoi', 'Sposta i dischi seguendo le regole', 2, 'facile', 90,
   'Allena la pianificazione e la capacità di problem solving sequenziale',
   '{"tipo": "torre_hanoi", "dischi": 3}'),
  ('esecutive-percorso-1', 'esecutive', 'Pianifica il Percorso', 'Trova il percorso più corto sulla mappa', 2, 'facile', 60,
   'Sviluppa la capacità di pianificazione e il ragionamento spaziale',
   '{"tipo": "percorso", "griglia": 4}'),
  ('esecutive-calcolo-1', 'esecutive', 'Calcolo Mentale', 'Risolvi le operazioni senza carta e penna', 3, 'medio', 60,
   'Mantiene le abilità di calcolo mentale e la concentrazione',
   '{"tipo": "calcolo", "operazioni": 8, "range": [10, 50]}'),
  ('esecutive-torre-2', 'esecutive', 'Torre di Hanoi (Difficile)', 'Più dischi, più ragionamento', 5, 'difficile', 120,
   'Massima stimolazione della pianificazione strategica',
   '{"tipo": "torre_hanoi", "dischi": 5}'),
  ('esecutive-doppio-1', 'esecutive', 'Doppio Compito', 'Esegui due compiti contemporaneamente', 4, 'difficile', 90,
   'Allena la flessibilità cognitiva e la gestione di più informazioni simultanee',
   '{"tipo": "doppio_compito"}')
on conflict do nothing;

-- ─── Esercizi Visuospaziali ───────────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, descrizione, livello, difficolta, durata_stimata, beneficio, config) values
  ('visuo-rotazione-1', 'visuospaziali', 'Rotazione Mentale', 'Quale forma corrisponde a quella ruotata?', 1, 'facile', 60,
   'Sviluppa la capacità di manipolazione mentale degli oggetti nello spazio',
   '{"tipo": "rotazione", "forme": 4, "angoli": [90, 180]}'),
  ('visuo-puzzle-1', 'visuospaziali', 'Puzzle Semplice', 'Ricomponi l''immagine spostando i pezzi', 1, 'facile', 90,
   'Stimola la percezione visiva e la capacità di orientamento spaziale',
   '{"tipo": "puzzle", "pezzi": 9}'),
  ('visuo-labirinto-1', 'visuospaziali', 'Labirinto', 'Trova l''uscita dal labirinto', 2, 'facile', 60,
   'Allena la pianificazione spaziale e la memoria di lavoro visiva',
   '{"tipo": "labirinto", "dimensione": "piccolo"}'),
  ('visuo-rotazione-2', 'visuospaziali', 'Rotazione Avanzata', 'Forme 3D da ruotare mentalmente', 4, 'medio', 90,
   'Potenzia la visualizzazione mentale tridimensionale',
   '{"tipo": "rotazione_3d", "forme": 4}'),
  ('visuo-puzzle-2', 'visuospaziali', 'Puzzle Difficile', 'Immagine complessa con molti pezzi', 5, 'difficile', 120,
   'Massima stimolazione della percezione spaziale e dell''attenzione al dettaglio',
   '{"tipo": "puzzle", "pezzi": 16}')
on conflict do nothing;

-- ─── Medaglie ─────────────────────────────────────────────────────────────────
insert into medaglie (id, nome, descrizione, icona, tipo, condizione) values
  ('prima-sfida',        'Prima Sfida',          'Hai completato il tuo primo esercizio!',         'star',   'completamento', '{"tipo": "totale_esercizi", "valore": 1}'),
  ('tre-giorni',         '3 Giorni di Fila',      'Ti alleni da 3 giorni consecutivi, bravo!',      'fire',   'streak',        '{"tipo": "streak", "valore": 3}'),
  ('una-settimana',      'Una Settimana!',         'Sette giorni di allenamento consecutivo!',       'muscle', 'streak',        '{"tipo": "streak", "valore": 7}'),
  ('un-mese',            'Un Mese Intero',         'Trenta giorni consecutivi, sei un campione!',    'trophy', 'streak',        '{"tipo": "streak", "valore": 30}'),
  ('dieci-esercizi',     'Allenatore',             'Hai completato 10 esercizi in totale',           'target', 'completamento', '{"tipo": "totale_esercizi", "valore": 10}'),
  ('cinquanta-esercizi', 'Veterano',               'Hai completato 50 esercizi in totale',           'medal',  'completamento', '{"tipo": "totale_esercizi", "valore": 50}'),
  ('maestro-memoria',    'Maestro della Memoria',  'Hai completato 10 esercizi di memoria',          'brain',  'categoria',     '{"tipo": "esercizi_categoria", "categoria": "memoria", "valore": 10}'),
  ('buon-compleanno',    'Buon Compleanno!',       'Tanti auguri! Festeggia allenando la mente',     'cake',   'speciale',      '{"tipo": "compleanno"}')
on conflict do nothing;
