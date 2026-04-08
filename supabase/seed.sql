-- BrainTrainer — Seed Data V1

-- Categorie
insert into categorie (id, nome, icona, descrizione, colore) values
  ('cat-memoria-id', 'Memoria', '🧠', 'Esercizi per allenare la memoria a breve e lungo termine', '#2563EB'),
  ('cat-attenzione-id', 'Attenzione', '🎯', 'Esercizi per migliorare la concentrazione e l''attenzione', '#7C3AED'),
  ('cat-linguaggio-id', 'Linguaggio', '💬', 'Esercizi per mantenere le capacità linguistiche', '#16A34A')
on conflict do nothing;

-- Esercizi Memoria
insert into esercizi (categoria_id, titolo, descrizione, difficolta, durata_stimata, beneficio, config) values
  ('cat-memoria-id', 'Ricorda le Parole', 'Memorizza le parole e poi riordinale', 'facile', 90,
   'Stimola la memoria di lavoro e la capacità di richiamare informazioni',
   '{"tipo": "memoria_parole", "parole": ["CASA", "LUNA", "PANE", "FIORE"], "tempo_visualizzazione": 5, "tempo_risposta": 30, "modalita": "riordina"}'),

  ('cat-memoria-id', 'Sequenza di Colori', 'Ripeti la sequenza di colori nell''ordine giusto', 'facile', 60,
   'Allena la memoria sequenziale e il coordinamento visivo-motorio',
   '{"tipo": "sequenza_colori", "lunghezza_sequenza": 4, "tempo_per_colore": 800, "colori": ["rosso", "blu", "verde", "giallo"]}'),

  ('cat-memoria-id', 'Ricorda le Parole (Medio)', 'Memorizza più parole in meno tempo', 'medio', 90,
   'Potenzia la memoria di lavoro con sfide crescenti',
   '{"tipo": "memoria_parole", "parole": ["MARE", "SOLE", "LIBRO", "ALBERO", "GATTO"], "tempo_visualizzazione": 4, "tempo_risposta": 25, "modalita": "riordina"}'),

  ('cat-memoria-id', 'Sequenza Lunga', 'Ripeti una sequenza più lunga di colori', 'medio', 90,
   'Migliora la capacità di memorizzazione sequenziale',
   '{"tipo": "sequenza_colori", "lunghezza_sequenza": 6, "tempo_per_colore": 700, "colori": ["rosso", "blu", "verde", "giallo", "viola", "arancione"]}'),

  ('cat-memoria-id', 'Ricorda le Parole (Difficile)', 'Sette parole da ricordare in poco tempo', 'difficile', 120,
   'Massima stimolazione della memoria di lavoro',
   '{"tipo": "memoria_parole", "parole": ["MONTAGNA", "FARFALLA", "CAPPELLO", "FINESTRA", "BICICLETTA", "CANDELA", "PONTE"], "tempo_visualizzazione": 4, "tempo_risposta": 20, "modalita": "riordina"}');

-- Esercizi Attenzione
insert into esercizi (categoria_id, titolo, descrizione, difficolta, durata_stimata, beneficio, config) values
  ('cat-attenzione-id', 'Trova le Differenze', 'Trova le 5 differenze tra le due immagini', 'facile', 60,
   'Allena la concentrazione e la percezione visiva del dettaglio',
   '{"tipo": "trova_differenze", "immagine_base": "/esercizi/differenze/01_a.png", "immagine_modificata": "/esercizi/differenze/01_b.png", "differenze": 5, "tempo": 60}'),

  ('cat-attenzione-id', 'Test Stroop', 'Di che colore è scritto questo testo?', 'medio', 60,
   'Potenzia il controllo cognitivo e l''inibizione delle risposte automatiche',
   '{"tipo": "stroop", "domande": 10, "tempo_per_domanda": 4}'),

  ('cat-attenzione-id', 'Trova le Differenze (Difficile)', 'Trova le differenze in meno tempo', 'difficile', 60,
   'Massima stimolazione dell''attenzione visiva',
   '{"tipo": "trova_differenze", "immagine_base": "/esercizi/differenze/02_a.png", "immagine_modificata": "/esercizi/differenze/02_b.png", "differenze": 7, "tempo": 45}'),

  ('cat-attenzione-id', 'Reazione Visiva', 'Tocca solo i cerchi del colore richiesto', 'facile', 60,
   'Migliora i tempi di reazione e la selezione visiva',
   '{"tipo": "reazione_visiva", "durata": 30, "colore_target": "blu"}'),

  ('cat-attenzione-id', 'Stroop Avanzato', 'Test Stroop con più domande e meno tempo', 'difficile', 60,
   'Massima stimolazione del controllo cognitivo',
   '{"tipo": "stroop", "domande": 15, "tempo_per_domanda": 3}');

-- Esercizi Linguaggio
insert into esercizi (categoria_id, titolo, descrizione, difficolta, durata_stimata, beneficio, config) values
  ('cat-linguaggio-id', 'Anagramma', 'Ricomponi le parole mischiate', 'facile', 45,
   'Stimola le capacità linguistiche e il pensiero flessibile',
   '{"tipo": "anagramma", "parole": ["AMORE", "TAVOLO", "GIARDINO"], "suggerimento": true, "tempo": 45}'),

  ('cat-linguaggio-id', 'Completa la Parola', 'Completa le parole con le lettere mancanti', 'facile', 30,
   'Mantiene il vocabolario attivo e la memoria delle parole',
   '{"tipo": "completa_parola", "parole": ["CA__", "F__RE", "LU__"], "soluzioni": ["CASA", "FIORE", "LUNA"]}'),

  ('cat-linguaggio-id', 'Anagramma Difficile', 'Parole più lunghe da ricomporre', 'medio', 60,
   'Potenzia le capacità linguistiche con sfide più complesse',
   '{"tipo": "anagramma", "parole": ["BIBLIOTECA", "FARFALLA", "CAMPAGNA"], "suggerimento": false, "tempo": 60}'),

  ('cat-linguaggio-id', 'Completa le Frasi', 'Trova la parola che completa la frase', 'medio', 45,
   'Stimola la comprensione semantica e il ragionamento linguistico',
   '{"tipo": "completa_parola", "parole": ["Il gatto beve il __TTE", "La notte è __URA", "Il sole è CA__DO"], "soluzioni": ["LATTE", "SCURA", "CALDO"]}'),

  ('cat-linguaggio-id', 'Anagramma Esperto', 'Parole molto complesse', 'difficile', 90,
   'Massima stimolazione delle capacità linguistiche',
   '{"tipo": "anagramma", "parole": ["RIVOLUZIONE", "MERAVIGLIOSO", "AVVENTURA"], "suggerimento": false, "tempo": 45}');

-- Medaglie V1
insert into medaglie (nome, descrizione, icona, tipo, condizione) values
  ('Prima Sfida', 'Hai completato il tuo primo esercizio!', '🌟', 'completamento', '{"tipo": "totale_esercizi", "valore": 1}'),
  ('3 Giorni di Fila', 'Ti alleni da 3 giorni consecutivi, bravo!', '🔥', 'streak', '{"tipo": "streak", "valore": 3}'),
  ('Una Settimana!', 'Sette giorni di allenamento consecutivo!', '💪', 'streak', '{"tipo": "streak", "valore": 7}'),
  ('Un Mese Intero', 'Trenta giorni consecutivi, sei un campione!', '🏆', 'streak', '{"tipo": "streak", "valore": 30}'),
  ('Allenatore', 'Hai completato 10 esercizi in totale', '🎯', 'completamento', '{"tipo": "totale_esercizi", "valore": 10}'),
  ('Veterano', 'Hai completato 50 esercizi in totale', '⭐', 'completamento', '{"tipo": "totale_esercizi", "valore": 50}'),
  ('Maestro della Memoria', 'Hai completato 10 esercizi di memoria', '🧠', 'categoria', '{"tipo": "esercizi_categoria", "categoria": "Memoria", "valore": 10}'),
  ('Buon Compleanno!', 'Tanti auguri! Festeggia allenando la mente', '🎂', 'speciale', '{"tipo": "compleanno"}')
on conflict do nothing;
