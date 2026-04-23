-- ─── VivaMente — Seed dati statici ───────────────────────────────────────────
-- Eseguire nel Supabase SQL Editor dopo aver applicato schema.sql + migrations.
-- Idempotente: usa ON CONFLICT DO NOTHING.

-- ─── Categorie ────────────────────────────────────────────────────────────────
insert into categorie (id, nome, icona, colore, descrizione) values
  ('memoria',       'Memoria',       'brain',  '#2563EB', 'Ricorda, memorizza, richiama'),
  ('attenzione',    'Attenzione',    'target', '#7C3AED', 'Concentrati, osserva, reagisci'),
  ('linguaggio',    'Linguaggio',    'chat',   '#16A34A', 'Parole, frasi, significati'),
  ('esecutive',     'Esecutive',     'puzzle', '#D97706', 'Pianifica, organizza, decidi'),
  ('visuospaziali', 'Visuospaziali', 'eye',    '#0F766E', 'Percepisci, orienta, visualizza')
on conflict (id) do nothing;

-- ─── Medaglie ─────────────────────────────────────────────────────────────────
insert into medaglie (id, nome, giorni, tipo, condizione) values
  ('giorno-1',   'Primo giorno',           1,   'streak', '{"giorni":1}'),
  ('giorni-2',   '2 giorni consecutivi',   2,   'streak', '{"giorni":2}'),
  ('giorni-3',   '3 giorni consecutivi',   3,   'streak', '{"giorni":3}'),
  ('giorni-7',   '7 giorni consecutivi',   7,   'streak', '{"giorni":7}'),
  ('giorni-10',  '10 giorni consecutivi',  10,  'streak', '{"giorni":10}'),
  ('giorni-14',  '14 giorni consecutivi',  14,  'streak', '{"giorni":14}'),
  ('giorni-28',  '28 giorni consecutivi',  28,  'streak', '{"giorni":28}'),
  ('giorni-50',  '50 giorni consecutivi',  50,  'streak', '{"giorni":50}'),
  ('giorni-100', '100 giorni consecutivi', 100, 'streak', '{"giorni":100}'),
  ('giorni-200', '200 giorni consecutivi', 200, 'streak', '{"giorni":200}'),
  ('giorni-365', '365 giorni consecutivi', 365, 'streak', '{"giorni":365}')
on conflict (id) do nothing;

-- ─── Esercizi (63 varianti) ───────────────────────────────────────────────────
insert into esercizi (id, categoria_id, titolo, difficolta, livello, famiglia, durata_stimata, beneficio, config) values

-- SEQUENCE TAP
('sequence-tap-numeri',   'memoria', 'Sequenza di Numeri',   'facile', 1, 'sequence_tap', 180, 'Allena la memoria di lavoro verbale e visuo-sequenziale.', '{"game":"sequence_tap","stimulusType":"numeri"}'),
('sequence-tap-parole',   'memoria', 'Sequenza di Parole',   'facile', 1, 'sequence_tap', 180, 'Allena la memoria di lavoro verbale.',                    '{"game":"sequence_tap","stimulusType":"parole"}'),
('sequence-tap-immagini', 'memoria', 'Sequenza di Immagini', 'facile', 1, 'sequence_tap', 180, 'Allena la memoria visuo-sequenziale.',                    '{"game":"sequence_tap","stimulusType":"immagini"}'),

-- RECALL GRID
('recall-grid-numeri', 'memoria', 'Griglia di Numeri', 'facile', 1, 'recall_grid', 180, 'Allena la memoria visuospaziale a breve termine.', '{"game":"recall_grid","stimulusType":"numeri"}'),
('recall-grid-parole', 'memoria', 'Griglia di Parole', 'facile', 1, 'recall_grid', 180, 'Allena la memoria visuospaziale e verbale.',       '{"game":"recall_grid","stimulusType":"parole"}'),

-- ODD ONE OUT
('odd-one-out-numeri-lettere', 'attenzione', 'Trova l''Intruso — Cifre e Lettere', 'facile', 1, 'odd_one_out', 180, 'Allena l''attenzione selettiva e la ricerca visiva.',          '{"game":"odd_one_out","stimulusType":"numeri_lettere"}'),
('odd-one-out-parole',         'attenzione', 'Trova l''Intruso — Parole',          'medio',  1, 'odd_one_out', 180, 'Allena l''attenzione selettiva e il riconoscimento lessicale.', '{"game":"odd_one_out","stimulusType":"parole"}'),
('odd-one-out-forme',          'attenzione', 'Trova l''Intruso — Forme',           'facile', 1, 'odd_one_out', 180, 'Allena la percezione visiva e la discriminazione delle forme.', '{"game":"odd_one_out","stimulusType":"forme"}'),

-- SORT IT
('sort-it-colore',     'esecutive', 'Sort It — Colori',     'facile',    1, 'sort_it', 180, 'Allena la flessibilità cognitiva e l''inibizione delle risposte automatiche.', '{"game":"sort_it","stimulusType":"colore"}'),
('sort-it-forma',      'esecutive', 'Sort It — Forme',      'facile',    1, 'sort_it', 180, 'Allena la flessibilità cognitiva e l''inibizione.',                           '{"game":"sort_it","stimulusType":"forma"}'),
('sort-it-numero',     'esecutive', 'Sort It — Numeri',     'medio',     1, 'sort_it', 180, 'Allena la flessibilità cognitiva e il ragionamento numerico.',                '{"game":"sort_it","stimulusType":"numero"}'),
('sort-it-texture',    'esecutive', 'Sort It — Texture',    'medio',     1, 'sort_it', 180, 'Allena la flessibilità cognitiva e la percezione visiva.',                    '{"game":"sort_it","stimulusType":"texture"}'),
('sort-it-dimensione', 'esecutive', 'Sort It — Dimensione', 'difficile', 1, 'sort_it', 180, 'Allena la flessibilità cognitiva e la comparazione visiva.',                  '{"game":"sort_it","stimulusType":"dimensione"}'),

-- HAYLING
('hayling-quotidiano', 'esecutive', 'Hayling',                               'medio',     1, 'hayling', 180, 'Allena il controllo inibitorio e la soppressione delle risposte automatiche.', '{"game":"hayling","sentenceType":"frasi_quotidiane"}'),
('hayling-narrativo',  'esecutive', 'Hayling — Frasi Narrative',             'medio',     1, 'hayling', 180, 'Allena il controllo inibitorio su testi narrativi.',                           '{"game":"hayling","sentenceType":"frasi_narrative"}'),
('hayling-tecnico',    'esecutive', 'Hayling — Frasi Tecnico-Scientifiche',  'difficile', 1, 'hayling', 180, 'Allena il controllo inibitorio su contenuti specialistici.',                   '{"game":"hayling","sentenceType":"frasi_tecnico_scientifiche"}'),

-- PASAT LIGHT
('pasat-light-single', 'attenzione', 'PASAT — Cifre',        'medio',     1, 'pasat_light', 180, 'Allena la memoria di lavoro aritmetica e l''attenzione sostenuta.', '{"game":"pasat_light","digitType":"single"}'),
('pasat-light-double', 'attenzione', 'PASAT — Cifre Doppie', 'difficile', 1, 'pasat_light', 180, 'Allena la memoria di lavoro aritmetica con numeri più complessi.',  '{"game":"pasat_light","digitType":"double"}'),

-- UPDATING WM
('updating-wm-numeri',           'memoria', 'Memoria in Aggiornamento',          'medio',     1, 'updating_wm', 180, 'Allena la memoria di lavoro e la capacità di aggiornare le informazioni.', '{"game":"updating_wm","stimulusType":"numerici"}'),
('updating-wm-parole-living',    'memoria', 'Aggiornamento WM — Esseri Viventi', 'medio',     1, 'updating_wm', 180, 'Allena l''aggiornamento della memoria di lavoro con parole semantiche.',   '{"game":"updating_wm","stimulusType":"parole_living"}'),
('updating-wm-parole-non-living','memoria', 'Aggiornamento WM — Oggetti',        'medio',     1, 'updating_wm', 180, 'Allena l''aggiornamento della memoria di lavoro con oggetti inanimati.',   '{"game":"updating_wm","stimulusType":"parole_non_living"}'),
('updating-wm-parole-miste',     'memoria', 'Aggiornamento WM — Parole Miste',   'difficile', 1, 'updating_wm', 180, 'Allena l''aggiornamento della memoria di lavoro con categorie miste.',     '{"game":"updating_wm","stimulusType":"parole_miste"}'),
('updating-wm-misti',            'memoria', 'Aggiornamento WM — Stimoli Misti',  'difficile', 1, 'updating_wm', 180, 'Allena la memoria di lavoro con switching tra domini.',                    '{"game":"updating_wm","stimulusType":"misti"}'),

-- MEMORIA DI PROSA
('memoria-prosa-narrativi',   'memoria', 'Memoria di Prosa',                'facile', 1, 'memoria_di_prosa', 180, 'Allena la comprensione e la memoria del testo.',                '{"game":"memoria_di_prosa","textType":"narrativi"}'),
('memoria-prosa-descrittivi', 'memoria', 'Memoria di Prosa — Descrittiva',  'facile', 1, 'memoria_di_prosa', 180, 'Allena la memoria episodica verbale su testi descrittivi.',      '{"game":"memoria_di_prosa","textType":"descrittivi"}'),
('memoria-prosa-procedurali', 'memoria', 'Memoria di Prosa — Procedurale',  'medio',  1, 'memoria_di_prosa', 180, 'Allena la memoria episodica verbale su testi procedurali.',      '{"game":"memoria_di_prosa","textType":"procedurali"}'),

-- MEMORIA LISTA
('memoria-lista-parole',            'memoria', 'Memoria Lista Parole',             'facile', 1, 'memoria_lista', 180, 'Allena la memoria verbale a lungo termine e il riconoscimento.',  '{"game":"memoria_lista","stimulusType":"parole_non_correlate"}'),
('memoria-lista-parole-semantiche', 'memoria', 'Memoria Lista — Parole Semantiche','facile', 1, 'memoria_lista', 180, 'Allena la memoria episodica con organizzazione semantica.',        '{"game":"memoria_lista","stimulusType":"parole_semantiche"}'),
('memoria-lista-numeri',            'memoria', 'Memoria Lista — Numeri',           'medio',  1, 'memoria_lista', 180, 'Allena la memoria numerica e il riconoscimento sequenziale.',      '{"game":"memoria_lista","stimulusType":"numeri"}'),
('memoria-lista-parole-living',     'memoria', 'Memoria Lista — Esseri Viventi',   'facile', 1, 'memoria_lista', 180, 'Allena la memoria categoriale per entità animate.',                '{"game":"memoria_lista","stimulusType":"parole_living"}'),
('memoria-lista-parole-non-living', 'memoria', 'Memoria Lista — Oggetti',          'facile', 1, 'memoria_lista', 180, 'Allena la memoria categoriale per oggetti inanimati.',             '{"game":"memoria_lista","stimulusType":"parole_non_living"}'),
('memoria-lista-immagini',          'memoria', 'Memoria Lista — Immagini',         'facile', 1, 'memoria_lista', 180, 'Allena la memoria visiva e il riconoscimento di immagini.',        '{"game":"memoria_lista","stimulusType":"immagini"}'),

-- MEMORIA PROSPETTICA
('memoria-prospettica-visiva',     'memoria', 'Memoria Prospettica',              'medio',     1, 'memoria_prospettica', 180, 'Allena la memoria prospettica e la gestione dei compiti secondari.', '{"game":"memoria_prospettica","cueType":"visivo_saliente"}'),
('memoria-prospettica-semantica',  'memoria', 'Memoria Prospettica — Semantica',  'medio',     1, 'memoria_prospettica', 180, 'Allena la memoria prospettica con cue semantici.',                    '{"game":"memoria_prospettica","cueType":"semantico"}'),
('memoria-prospettica-time-based', 'memoria', 'Memoria Prospettica — A Tempo',    'difficile', 1, 'memoria_prospettica', 180, 'Allena la memoria prospettica basata sul tempo.',                     '{"game":"memoria_prospettica","cueType":"time_based"}'),

-- SART
('sart-cifre', 'attenzione', 'SART — Reazione', 'facile', 1, 'sart', 180, 'Allena l''inibizione delle risposte e l''attenzione sostenuta.', '{"game":"sart"}'),

-- GO NO-GO
('go-nogo-cromatico',  'esecutive', 'Go / No-Go Colori',       'facile',    1, 'go_nogo', 180, 'Allena l''inibizione e il controllo delle risposte impulsive.',       '{"game":"go_nogo","stimulusType":"cromatico"}'),
('go-nogo-semantico',  'esecutive', 'Go / No-Go — Semantico',  'medio',     1, 'go_nogo', 180, 'Allena l''inibizione semantica e l''attenzione selettiva.',          '{"game":"go_nogo","stimulusType":"semantico"}'),
('go-nogo-multimodale','esecutive', 'Go / No-Go — Multimodale','difficile', 1, 'go_nogo', 180, 'Allena l''inibizione divisa su più canali sensoriali.',              '{"game":"go_nogo","stimulusType":"multimodale"}'),
('go-nogo-lessicale',  'esecutive', 'Go / No-Go — Lessicale',  'medio',     1, 'go_nogo', 180, 'Allena l''inibizione lessicale e la decisione rapida sulle parole.', '{"game":"go_nogo","stimulusType":"lessicale"}'),

-- DUAL TASK
('dual-task', 'attenzione', 'Doppio Compito', 'difficile', 1, 'dual_task', 180, 'Allena la divisione dell''attenzione e la gestione di compiti multipli.', '{"game":"dual_task"}'),

-- VIGILANCE
('vigilance', 'attenzione', 'Vigilanza', 'medio', 1, 'vigilance', 180, 'Allena l''attenzione sostenuta e la vigilanza nel tempo.', '{"game":"vigilance"}'),

-- STROOP
('stroop-color-word', 'esecutive', 'Stroop — Colore e Parola', 'medio', 1, 'stroop', 180, 'Allena l''inibizione e il controllo dell''interferenza automatica.', '{"game":"stroop_color_word"}'),
('stroop-spatial',    'esecutive', 'Stroop Spaziale',          'medio', 1, 'stroop', 180, 'Allena il controllo dell''interferenza spaziale (effetto Simon).',  '{"game":"spatial_stroop"}'),

-- TASK SWITCHING
('task-switching-numeri', 'esecutive', 'Task Switching', 'medio', 1, 'task_switching', 180, 'Allena la flessibilità cognitiva e la capacità di cambiare strategia.', '{"game":"task_switching"}'),

-- FLANKER
('flanker-frecce', 'attenzione', 'Flanker — Frecce', 'facile', 1, 'flanker', 180, 'Allena l''attenzione selettiva e il controllo dell''interferenza.', '{"game":"flanker"}'),

-- DCCS LIGHT
('dccs-light', 'esecutive', 'DCCS — Classifica Carte', 'facile', 1, 'dccs_light', 180, 'Allena la flessibilità cognitiva e la capacità di seguire regole.', '{"game":"dccs_light"}'),

-- PIANIFICAZIONE
('pianificazione-tol',    'esecutive', 'Torre di Londra',             'facile',    1, 'pianificazione', 180, 'Allena la pianificazione, la previsione e il problem solving.', '{"game":"pianificazione","variant":"tower_of_london"}'),
('pianificazione-brixton','esecutive', 'Brixton — Anticipa il Punto', 'difficile', 1, 'pianificazione', 180, 'Allena il ragionamento induttivo e la pianificazione spaziale.',  '{"game":"pianificazione","variant":"brixton"}'),

-- VERBAL FLUENCY
('verbal-fluency-categoriale', 'linguaggio', 'Fluenza Verbale',             'facile',    1, 'verbal_fluency', 180, 'Allena il recupero lessicale e la fluidità verbale.',                  '{"game":"verbal_fluency","variant":"categoriale"}'),
('verbal-fluency-alternata',   'linguaggio', 'Fluenza Verbale — Alternata', 'difficile', 1, 'verbal_fluency', 180, 'Allena la flessibilità cognitiva e il recupero lessicale alternato.', '{"game":"verbal_fluency","variant":"alternata"}'),
('verbal-fluency-fonemica',    'linguaggio', 'Fluenza Verbale — Fonemica',  'medio',     1, 'verbal_fluency', 180, 'Allena la fluenza fonemica e il recupero lessicale fonologico.',      '{"game":"verbal_fluency","variant":"fonemica"}'),

-- LINGUAGGIO
('linguaggio-naming',               'linguaggio', 'Naming',               'facile', 1, 'linguaggio', 180, 'Allena il recupero dei nomi e il vocabolario attivo.',                      '{"game":"linguaggio","variant":"naming"}'),
('linguaggio-lexical-decision',     'linguaggio', 'Decisione Lessicale',  'medio',  1, 'linguaggio', 180, 'Allena il riconoscimento lessicale e la velocità di elaborazione.',          '{"game":"linguaggio","variant":"lexical_decision"}'),
('linguaggio-sentence-anagram',     'linguaggio', 'Anagramma di Frase',   'medio',  1, 'linguaggio', 180, 'Allena la comprensione sintattica e la memoria di lavoro verbale.',          '{"game":"linguaggio","variant":"sentence_anagram"}'),
('linguaggio-semantic-relatedness', 'linguaggio', 'Relazione Semantica',  'facile', 1, 'linguaggio', 180, 'Allena la memoria semantica e l''associazione concettuale.',                 '{"game":"linguaggio","variant":"semantic_relatedness"}'),
('linguaggio-proverb-completion',   'linguaggio', 'Proverbi',             'facile', 1, 'linguaggio', 180, 'Allena la memoria culturale semantica e la conoscenza idiomatica.',          '{"game":"linguaggio","variant":"proverb_completion"}'),

-- MENTAL ROTATION
('mental-rotation-forme',      'visuospaziali', 'Rotazione Mentale',              'facile',    1, 'mental_rotation', 180, 'Allena la rotazione mentale e la percezione spaziale.',                  '{"game":"mental_rotation","stimulusType":"forme"}'),
('mental-rotation-oggetti-3d', 'visuospaziali', 'Rotazione Mentale — Oggetti 3D', 'difficile', 1, 'mental_rotation', 180, 'Allena la rotazione mentale su oggetti tridimensionali complessi.',      '{"game":"mental_rotation","stimulusType":"oggetti_3d"}'),

-- FIGURE GROUND
('figure-ground-forme',   'visuospaziali', 'Figura e Sfondo',           'facile', 1, 'figure_ground', 180, 'Allena la percezione visiva e la discriminazione figura-sfondo.', '{"game":"figure_ground","stimulusType":"forme"}'),
('figure-ground-oggetti', 'visuospaziali', 'Figura e Sfondo — Oggetti', 'medio',  1, 'figure_ground', 180, 'Allena la percezione figura-sfondo su scene realistiche.',         '{"game":"figure_ground","stimulusType":"oggetti"}'),

-- BLOCK DESIGN
('block-design-colori', 'visuospaziali', 'Block Design',               'facile', 1, 'block_design', 180, 'Allena la costruzione visuospaziale e la memoria visiva.',        '{"game":"block_design","stimulusType":"colori"}'),
('block-design-bw',     'visuospaziali', 'Block Design — Bianco e Nero','medio', 1, 'block_design', 180, 'Allena la costruzione visuospaziale senza l''aiuto del colore.', '{"game":"block_design","stimulusType":"bw"}')

on conflict (id) do nothing;
