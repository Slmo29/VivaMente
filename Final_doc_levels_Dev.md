npm warn exec The following package was not found and will be installed: mammoth@1.12.0
__BRAIN TRAINING APP__

Documento di specifiche* — Popolazione Senior 60\+*

# __Come leggere questo documento__

Questo documento è organizzato per famiglie di giochi\.   
Ogni famiglia condivide la stessa meccanica core e la stessa tabella di progressione livelli — l'unica variabile tra le varianti è il tipo di stimolo \(stimulusType nel JSON di configurazione\)\.   
Questo significa che il motore di gioco va implementato una volta per famiglia; le varianti differiscono solo nel dataset caricato\.

Nota sugli stimoli visivi: per tutti gli esercizi che prevedono immagini, si raccomanda l'uso di icone/illustrazioni vettoriali flat \(emoji\) \(stile outline o filled, non fotografie\)\.   
Un set di ~300 emoji categorizzate \(oggetti quotidiani, animali, cibo, azioni, luoghi, volti stilizzati, forme geometriche\) copre la totalità degli esercizi\. Le icone devono essere leggibili su schermo piccolo, ad alto contrasto, e disponibili in versione monocromatica \(per livelli bassi\) e a colori \(per livelli avanzati\)\. Questo approccio garantisce uniformità visiva, facilità di manutenzione del dataset, e accessibilità per utenti senior 60\+\.

Per ogni famiglia trovi:

1. Descrizione della meccanica — cosa deve fare il giocatore
2. Parametri di difficoltà — le leve che cambiano tra livelli
3. Tabella livelli — i valori esatti per i 20 livelli
4. Varianti — elenco dei giochi con il relativo stimulusType
5. Metriche da tracciare e JSON di configurazione esempio

# __Regole comuni a tutti i giochi__

## __Progressione adattiva__

La stessa logica si applica a tutti gli 84 giochi\. L'accuratezza è calcolata sugli ultimi 3 trial\.

__Soglia accuratezza__

__Finestra__

__Azione__

> 80% corretti

Ultimi 3 esercizi della stessa tipologia cognitiva

Promozione \(\+1 livello\)

70%–80%

Ultimi 3 esercizi della stessa tipologia cognitiva

Mantenimento

< 70% corretti

Ultimi 3 esercizi della stessa tipologia cognitiva

Retrocessione \(−1 livello\)

*ℹ️  Limite inferiore: mai sotto il livello 1\. Limite superiore: mai oltre il livello 20\.*

*ℹ️  Onboarding \(per tutti\): livello fisso 1, 1 trial — non soggetto a logica adattiva\.*

Struttura della sessione giornaliera: ogni giorno vengono proposti esattamente 5 esercizi, uno per ciascuna delle 5 tipologie cognitive \(Memoria, Linguaggio, Attenzione, Funzioni Esecutive, Funzioni Visuospaziali\)\. 5 esercizi × 3 minuti = 15 minuti totali al giorno\.   
La selezione avviene in modo casuale rispettando questa regola: un esercizio non può essere riproposto finché non sono stati selezionati almeno N esercizi diversi \(appartenenti alla stessa tipologia cognitiva\) dopo la sua ultima apparizione\. N = min\(5, totale\_giochi\_della\_tipologia − 1\) — configurabile per tipologia\.

__Timer universale__: ogni esercizio dura esattamente **3 minuti**\. Il sistema fa entrare quanti trial o run si completano nel tempo disponibile\. Il parametro `trialsPerSession` presente nelle configurazioni è orientativo \(usato per dimensionare il bilanciamento dei parametri\), non fisso\.

##   
__Metriche da tracciare \(per tutti i giochi\)__

__Metrica__

__Cosa misura__

Accuratezza \(per trial e per sessione\)

Corretto/Errato\. Per sessione: % trial corretti/totale\. 

Timer sessione \(fisso\)

3 minuti per ogni esercizio, universale\. Il sistema conta quanti trial entrano nel tempo disponibile\.

Timer trial \(variabile\)

Tempo limite per rispondere al singolo stimolo \(`timeLimitMs` nel JSON\)\. Assente ai livelli bassi, decrescente ai livelli alti\. Specificato nella tabella livelli di ogni famiglia dove applicabile\.

## __Criterio generale per la generazione delle parole__

Per tutti gli esercizi che prevedono la generazione di parole, la progressione del livello determina la progressiva diminuzione della frequenza d’uso delle parole: ai livelli bassi vengono utilizzate parole ad alta frequenza d’uso \(parole comuni e familiari\), mentre ai livelli alti vengono utilizzate parole a bassa frequenza d’uso \(parole rare o specialistiche\)\. A titolo di esempio: lv 1 → parole d’uso comune e quotidiano; lv 20 → parole a bassa frequenza d’uso\.

# __Catalogo esercizi — riepilogo per famiglia__

64 giochi raggruppati in 24 famiglie\. Ogni riga mostra la famiglia, i giochi che la compongono \(con ID\) e il dominio cognitivo allenato\.

__\#__

__Famiglia__

__Giochi__

__Varianti \(stimulusType\)__

__Dominio cognitivo__

1

SEQUENCE TAP

1–3

Numeri, Parole, Immagini

Memoria di lavoro verbale/visuo\-sequenziale

MEMORIA

2

RECALL GRID

7–8

Numeri, Parole

Memoria visuospaziale a breve termine

MEMORIA

3

ODD ONE OUT

13–15

Numeri/Lettere, Parole, Forme

Attenzione selettiva / Ricerca visiva

ATTENZIONE

4

SORT IT

19–23

Colore, Forma, Numero, Texture, Dimensione

Flessibilità cognitiva / Funzioni esecutive

FUNZIONI ESECUTIVE

5

HAYLING GAME

24–26

Frasi quotidiane, Narrative, Tecnico\-scientifiche

Inibizione risposta automatica / Controllo esecutivo verbale

FUNZIONI ESECUTIVE

6

PASAT LIGHT

27–28

Visivo cifre singole, Visivo cifre doppie

Memoria di lavoro / Velocità elaborazione / Attenzione sostenuta

MEMORIA

7

UPDATING WM

30–34

Stimoli numerici, Parole living, Parole non\-living, Parole miste, Misti

Aggiornamento memoria di lavoro \(updating\)

MEMORIA

8

MEMORIA DI PROSA

35–37

Testi narrativi, Descrittivi, Procedurali

Memoria episodica verbale

MEMORIA

9

MEMORIA LISTA

38–43

Parole semantiche, Non correlate, Numeri, Parole living, Parole non\-living, Parole miste

Memoria episodica verbale/visiva / Encoding e retrieval

MEMORIA

10

MEMORIA PROSPETTICA

44–46

Cue visivo saliente, Cue semantico, Time\-based puro

Memoria prospettica event\-based / time\-based

 MEMORIA

11

SART

47

Cifre → Lettere → Simboli \(all'interno del gioco\)

Attenzione sostenuta / Inibizione risposta

ATTENZIONE 

12

GO/NO\-GO

48–50, 68

Cromatico, Semantico, Multimodale, Lessicale

Inibizione motoria / Attenzione selettiva\-divisa

FUNZIONI ESECUTIVE

13

DUAL TASK

51

Tapping \+ task cognitivo secondario

Attenzione divisa / Gestione risorse cognitive

ATTENZIONE

14

VIGILANCE

52

Clock analogico

Attenzione sostenuta / Vigilanza

ATTENZIONE

15

STROOP

53–54

Color\-Word Stroop, Spatial Stroop \(Simon Task\)

Inibizione / Controllo interferenza

FUNZIONI ESECUTIVE

16

TASK SWITCHING

55

Numeri → Immagini → Parole \(all'interno del gioco\)

Shifting esecutivo / Flessibilità cognitiva

FUNZIONI ESECUTIVE

17

FLANKER

56

Frecce → Lettere → Simboli \(all'interno del gioco\)

Inibizione interferenza laterale

FUNZIONI ESECUTIVE

18

PIANIFICAZIONE

57–58

Tower of London Light, Brixton Spatial Anticipation

Pianificazione esecutiva / Ragionamento induttivo

FUNZIONI ESECUTIVE

19

VERBAL FLUENCY

59, 61–62

Alternata, Categoriale, Fonemica

Flessibilità cognitiva / Recupero lessicale\-semantico

FUNZIONI ESECUTIVE

20

DCCS LIGHT

69

Colore → Forma → Numero \(all'interno del gioco\)

Flessibilità cognitiva / Shifting

FUNZIONI ESECUTIVE

21

LINGUAGGIO & DENOMINAZIONE

63–67

Naming, Lexical Decision, Sentence Anagram, Semantic Relatedness, Proverb Completion

Accesso lessicale / Elaborazione semantica

LINGUAGGIO
22

MENTAL ROTATION

70–71

Forme geometriche, Oggetti 3D

Rotazione mentale / Analisi spaziale

VISUOSPAZIALI

23

FIGURE GROUND

72–73

Forme, Oggetti/scene

Analisi figura\-sfondo / Attenzione visuospaziale

VISUOSPAZIALI

24

BLOCK DESIGN

74–75

Pattern colori, Pattern b/n

Ragionamento visuocostruttivo / Analisi spaziale

VISUOSPAZIALI

# __Schede famiglia — specifiche di sviluppo__

*ℹ️  Ogni famiglia = 1 implementazione\. Le varianti cambiano solo il dataset \(stimulusType\)\.*

## __Famiglia 1 — SEQUENCE TAP  \(giochi 1–3\)__

Il giocatore vede una sequenza di stimoli presentati uno alla volta e deve riprodurla tappando nell'ordine corretto \(forward\) o inverso \(backward\)\. Ispirato al Digit Span del WAIS\-IV e al Corsi Block\-Tapping Test\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Lunghezza sequenza

3 → 10 elementi \(\+1 ogni ~2 livelli\)

Velocità presentazione

2000 → 700 ms per stimolo \(−150 ms ogni ~2 lv\)

Modalità

Forward \(lv 1–9\) → Forward\+Backward \(lv 10–15\) → Solo Backward \(lv 16–20\)

Tempo limite risposta

Assente \(lv 1–17\) → 8000 → 6000 ms

Trial per sessione

4 → 10

__Tabella livelli__

__Lv__

__Seq\.Len__

__Speed \(ms\)__

__Modalità__

__T\.Lim \(ms\)__

__Trial__

1

3

2000

forward

—

4

2

3

1800

forward

—

5

3

4

1800

forward

—

6

4

4

1600

forward

—

7

5

5

1600

forward

—

8

6

5

1400

forward

—

8

7–9

5–6

1400→1200

forward

—

8–9

10

6

1200

both

—

9

11–12

7

1200→1000

both

—

10

13–15

7–8

1000→900

both

—

10

16–17

8–9

900

backward

—

10

18

9

800

backward

8000

10

19

10

800

backward

7000

10

20

10

700

backward

6000

10

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

1

Sequence Tap — Numeri

"numeri"

2

Sequence Tap — Parole

"parole"

3

Sequence Tap — Immagini 

"immagini"      

__Metriche__

• Accuratezza per trial \(corretto/errato\) — per trial e per sessione

• Timer trial \(riduzione progressiva all’aumentare del livello\)

__JSON esempio \(lv 5, numeri\)__

\{"game":"sequence\_tap","level":5,"sequenceLength":5,"presentationSpeedMs":1600,"stimulusType":"numeri","mode":"forward","timeLimitMs":null,"trialsPerSession":8\}

## __Famiglia 2 — RECALL GRID  \(giochi 7–11\)__

Una griglia mostra brevemente stimoli in posizioni casuali; dopo un delay la griglia vuota viene ripresentata e il giocatore deve indicare le posizioni memorizzate\. Ispirato al Corsi Block\-Tapping e al delayed match\-to\-sample\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Dimensione griglia

3×3 → 6×6 \(\+1 riga/colonna ogni ~5 lv\)

N stimoli da ricordare

2 → 10 \(\+1 ogni 1–2 lv\)

Esposizione

3000 → 800 ms \(−150 ms ogni ~2 lv\)

Delay

1000 → 5000 ms \(\+500 ms ogni 2–3 lv\)

Trial per sessione

5 → 10

__Tabella livelli__

__Lv__

__Griglia__

__N Stim\.__

__Espos\. \(ms\)__

__Delay \(ms\)__

__Trial__

1

3×3

2

3000

1000

5

2

3×3

2

3000

1500

5

3–4

3×3

3

2500

1500→2000

6

5

3×3

4

2000

2000

7

6–7

4×4

3–4

2000

2000→2500

7

8–9

4×4

4–5

1800

2500→3000

8

10–12

4×4

5–6

1600→1500

3000→3500

8–9

13–15

5×5

5–7

1500→1400

3000→3500

9

16–18

5×5

7–9

1200→1000

3500→4000

10

19

6×6

8

1000

4500

10

20

6×6

10

800

5000

10

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

7

Recall Grid — Numeri

"numeri"

8

Recall Grid — Parole

"parole"

__Metriche__

• Accuratezza posizionale per trial \(N posizioni corrette / N stimoli\) — per trial e per sessione

• Timer trial \(riduzione progressiva all’aumentare del livello\)

__JSON esempio \(lv 7\)__

\{"game":"recall\_grid","level":7,"gridSize":"4x4","nStimuli":4,"stimulusType":"numeri","exposureDurationMs":2000,"delayMs":2500,"trialsPerSession":7\}

## __Famiglia 3 — ODD ONE OUT  \(giochi 13–17\)__

Una griglia di stimoli contiene un elemento diverso dagli altri \(target\); il giocatore deve toccarlo\. La difficoltà aumenta con N distrattori, somiglianza al target e introduzione di interferenza Stroop ai livelli alti\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

N distrattori

4 → 40 \(\+2–4 per livello\)

Somiglianza target\-distrattori

Alta → Media → Bassa → Molto bassa

Dimensione discriminante

Forma → Colore → Colore\+Forma → Tutte → \+Stroop → 2×Stroop

Tempo limite

8000 → 2000 ms \(−500 ms ogni ~2 lv\)

Trial per sessione

6 → 10

__Tabella livelli \(chiave\)__

__Lv__

__N Distr\.__

__Somig\.__

__Dim\. discrim\.__

__T\.Lim \(ms\)__

__Trial__

1

4

alta

forma

8000

6

2–4

6–8

alta→media

forma→colore

8000→7000

7–8

5–7

10–12

media→bassa

colore→forma\+col\.

6000→5000

8–9

8–12

16–24

media→bassa

forma→forma\+col\.

5000→4000

9–10

13–15

24–25

molto bassa

tutte

3500→3000

10

16–18

30–35

molto bassa

\+Stroop

3000→2500

10

19–20

35–40

molto bassa

2×Stroop

2500→2000

10

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

13

Odd One Out — Numeri/Lettere

"numeri\_lettere"

14

Odd One Out — Parole

"parole"

15

Odd One Out — Forme

“forme”

__QUA SI POSSONO UTILIZZARE Nota stimoli: per le varianti di forma usare forme geometriche vettoriali colorate \(cerchi, quadrati, triangoli, esagoni, pentagoni, stelle, rombi\)\. Le forme variano sistematicamente in colore, dimensione e orientamento per costruire la dimensione discriminante\. Ai livelli alti aggiungere interferenza Stroop\-like \(es\. la parola "triangolo" scritta dentro una forma quadrata\)\.__

__Metriche__

• Accuratezza per trial \(corretto/errato\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 8\)__

\{"game":"odd\_one\_out","level":8,"nDistractors":16,"similarity":"media","discriminatingDimension":"forma","stimulusType":"numeri\_lettere","timeLimitMs":5000,"trialsPerSession":9\}

## __Famiglia 4 — SORT IT  \(giochi 19–23\)__

Il giocatore smista stimoli in categorie secondo una regola che cambia periodicamente senza preavviso esplicito\. Ispirato al Wisconsin Card Sorting Test\. __Come funziona: lo schermo mostra una serie di carte con caratteristiche multiple \(colore, forma, numero\) e N zone di destinazione\. Il giocatore trascina ogni carta nella categoria corretta\. Lv 1–5: la regola attiva e' indicata esplicitamente, feedback completo \(✓ verde / ✗ rosso con categoria corretta\)\. Lv 6–10: feedback solo ✓/✗, nessuna spiegazione\. Lv 11–20: nessun feedback e nessun cue sulla regola, che cambia silenziosamente ogni N stimoli corretti: il giocatore deve accorgersi del cambio e inferire la nuova regola dai risultati precedenti\.__

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

N categorie

2 \(lv 1–5\) → 3 \(lv 6–12\) → 4 \(lv 13–20\)

Stimoli per categoria

8 → 1

Frequenza cambio regola

Ad ogni stimolo → ogni 3–5 stimoli

Feedback

Pieno \(lv 1–5\) → Ridotto \(lv 6–10\) → Nessuno \(lv 11–20\)

Trial per sessione

6 → 10

__Tabella livelli \(chiave\)__

__Lv__

__N Cat\.__

__Stim/Cat__

__Cambio regola__

__Feedback__

__Trial__

1

2

8

sempre

piena

6

5

2

6

sempre

ridotta

7

10

3

4

ogni 5

nessuna

9

15

4

3

ogni 3

nessuna

10

20

4

1

ogni 1

nessuna

10

__Varianti — primaryDimension__

__ID__

__Nome__

__stimulusType \(JSON\)__

19

Sort It — Categorizzazione per Colore

"colore"

20

Sort It — Categorizzazione per Forma

"forma"

21

Sort It — Categorizzazione per Numero

"numero"

22

Sort It — Categorizzazione per Texture

"texture"

23

Sort It — Categorizzazione per Dimensione

"dimensione"

__Metriche__

• Accuratezza per trial \(categoria corretta\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"sort\_it","level":10,"nCategories":3,"stimuliPerCategory":4,"ruleSwitchEveryN":5,"primaryDimension":"colore","feedbackType":"none","trialsPerSession":9\}

## __Famiglia 5 — HAYLING GAME  \(giochi 24–26\)__

Una frase incompleta viene presentata\. Parte A: completare con la parola congruente\. Parte B: fornire una parola semanticamente NON correlata \(inibizione\)\. Ispirato all'Hayling Sentence Completion Test\.

__Struttura delle frasi: ogni frase deve terminare con una parola mancante e avere un unico completamento molto prevedibile \(lv 1–5\), un completamento probabile tra pochi candidati \(lv 6–12\), o completamenti poco prevedibili \(lv 13–20\)\. Parte A: il giocatore seleziona o digita la parola che completa naturalmente la frase \(es\. "Il gatto beve il \_\_\_" → "latte"\)\. Parte B: deve fornire una parola completamente non correlata al contesto \(qualsiasi parola tranne quelle semanticamente legate alla frase, come "latte", "acqua", "liquido"\)\. I distrattori nella scelta multipla devono includere: la risposta corretta A, una risposta plausibile, e due distrattori non correlati\. Dataset minimo: 200 frasi per livello di prevedibilita', con forme parallele A/B per evitare ripetizioni ravvicinate\.__

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Tipo frase

Alta prevedibilità → Media → Bassa → Molto bassa

Modalità

Solo A \(lv 1–3\) → A\+B \(lv 4–12\) → Solo B \(lv 13–20\)

Tempo limite

Assente → 8000 → 3000 ms

Tipo risposta

Scelta multipla \(lv 1–7\) → Input libero \(lv 8–20\)

Trial per sessione

6 → 10

__Tabella livelli \(chiave\)__

__Lv__

__Tipo frase__

__Modalità__

__T\.Lim \(ms\)__

__Tipo risposta__

__Trial__

1

alta prev\.

solo A

—

scelta mult\.

6

5

alta prev\.

A\+B

—

scelta mult\.

8

10

media prev\.

A\+B

6000

input libero

9

15

bassa prev\.

solo B

5000

input libero

10

20

m\.bassa prev\.

solo B

3000

input libero

10

__Varianti — sentenceType__

__ID__

__Nome__

__stimulusType \(JSON\)__

24

Hayling Game — Frasi quotidiane

"frasi\_quotidiane"

25

Hayling Game — Frasi narrative

"frasi\_narrative"

26

Hayling Game — Frasi tecnico\-scientifiche

"frasi\_tecnico\_scientifiche"

__Metriche__

• Accuratezza Parte B per trial \(risposta non\-correlata\)   • RT Parte B per trial \(ms dall'onset frase alla risposta\)

__JSON esempio \(lv 8\)__

\{"game":"hayling","level":8,"sentenceType":"frasi\_quotidiane","mode":"A\_and\_B","timeLimitMs":7000,"responseType":"free\_input","trialsPerSession":9\}

## __Famiglia 6 — PASAT LIGHT  \(giochi 27–28\)__

Ogni stimolo numerico deve essere sommato al precedente \(N \+ N\-1\)\. Presentazione visiva\. ISI decresce progressivamente\. Ispirato al PASAT \(Gronwall, 1977\)\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

ISI \(Inter\-Stimulus Interval\)

3000 → 1500 ms \(−100 ms ogni ~2 lv\)

Modalità presentazione

Visiva \(tutti i livelli\)

Lunghezza sequenza

5 → 20 stimoli

Interferenza

Assente → Bassa → Media → Alta

Trial per sessione

5 → 10

__Tabella livelli \(chiave\)__

__Lv__

__ISI \(ms\)__

__Lung\. Seq\.__

__Interferenza__

__Trial__

1

3000

5

assente

5

5

2600

9

assente

7

10

2200

14

assente

9

15

1700

17

assente

10

20

1500

20

alta

10

__Varianti — digitType / modality__

__ID__

__Nome__

__stimulusType \(JSON\)__

27

PASAT Light — Visivo, cifre singole

"visual\_single"

28

PASAT Light — Visivo, cifre doppie

"visual\_double"

__Metriche__

• Accuratezza per item \(% somme corrette\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10, gioco 27\)__

\{"game":"pasat\_light","level":10,"isiMs":2200,"modality":"visual","digitType":"single","sequenceLength":14,"trialsPerSession":9\}

## __Famiglia 7 — UPDATING WM  \(giochi 30–34\)__

Il giocatore tiene aggiornato un valore target \(es\. il massimo finora\) man mano che la sequenza viene mostrata, e risponde alla fine\. La regola può switchare tra più tipi\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Lunghezza sequenza

3 → 15 elementi

Velocità presentazione

2000 → 800 ms

Tipo regola

Singola → Switching 2 regole → Switching 3 regole

Dominio stimoli

Omogeneo → Misto

Trial per sessione

5 → 10

__Tabella livelli \(chiave\)__

__Lv__

__Lung\. Seq\.__

__Vel\. \(ms\)__

__Tipo regola__

__Dominio__

__Trial__

1

3

2000

singola

omogeneo

5

5

5

1800

singola

omogeneo

7

10

7

1500

switching

misto

9

15

10

1300

sw 2 regole

misto

10

20

15

800

sw 3 regole

misto

10

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

30

Updating WM — Stimoli numerici

"numerici"

31

Updating WM — Parole living

"parole\_living"

32

Updating WM — Parole non\-living

"parole\_non\_living"

33

Updating WM — Parole miste

"parole\_miste"

34

Updating WM — Misti

"misti"

__Metriche__

• Accuratezza per trial \(% item corretti\)   • Tempo decisionale per trial \(ms dall'ultimo elemento alla risposta\)

__JSON esempio \(lv 9\)__

\{"game":"updating\_wm","level":9,"sequenceLength":7,"presentationSpeedMs":1600,"ruleType":"switching","stimulusType":"numerici","trialsPerSession":9\}

## __Famiglia 8 — MEMORIA DI PROSA  \(giochi 35–37\)__

Un breve brano viene letto/mostrato; dopo un delay il giocatore risponde a domande di riconoscimento o richiamo\. Ispirato al Logical Memory della WMS\-IV\.

__Tabella livelli \(chiave\)__

__Lv__

__N frasi__

__Delay \(s\)__

__Tipo richiamo__

__Distrattori__

__Trial__

1

2

0

riconoscimento

assenti

4

5

4

0

riconoscimento

n\.correlati

5

10

6

120

richiamo parz\.

semantici

7

15

9

240

richiamo libero

sem\.simili

9

20

10

300

richiamo libero

sem\.\+fonetici

10

__Varianti — textType__

__ID__

__Nome__

__stimulusType \(JSON\)__

35

Memoria di Prosa — Testi narrativi

"narrativi"

36

Memoria di Prosa — Testi descrittivi

"descrittivi"

37

Memoria di Prosa — Testi procedurali

"procedurali"

__Specifiche dei brani — ogni testo deve contenere almeno 6 unita' informative discrete \(chi, cosa, quando, dove, come, perche'\)\. Narrativi: storie di vita quotidiana ambientate in contesti familiari per utenti 60\+ \(casa, mercato, medico, passeggiata\)\. Descrittivi: descrizioni di luoghi, oggetti o personaggi noti\. Procedurali: sequenze di azioni in ordine logico \(ricetta, istruzione, modulo\)\. Lv 1–7: 2–4 frasi, lessico comune, richiamo immediato\. Lv 8–14: 5–7 frasi, un dettaglio periferico, delay fino a 2 min\. Lv 15–20: 8–10 frasi, inferenze implicite, delay fino a 5 min, distrattori fonetici e semantici\. Dataset minimo: 40 brani per tipologia x 2 forme = 240 brani totali\.__

__Metriche__

• Accuratezza per trial \(% unità informative corrette\)   • Nessun RT distinto \(tempo di lettura incluso nella risposta\)

__JSON esempio \(lv 10\)__

\{"game":"memoria\_prosa","level":10,"nSentences":6,"delayS":120,"recallType":"partial","textType":"narrativi","trialsPerSession":7\}

## __Famiglia 9 — MEMORIA LISTA  \(giochi 38–43\)__

Una lista di parole/immagini viene mostrata; dopo un delay il giocatore riconosce i target tra distrattori\. Ispirato al RAVLT e CVLT\. Liste multiple introducono interferenza proattiva/retroattiva\.

__OK La sessione prevede due fasi in sequenza: \(1\) Rievocazione libera — subito dopo il delay il giocatore seleziona o digita quanti piu' item ricorda, nell'ordine che vuole, senza indizi\. Precede sempre il riconoscimento per evitare contaminazione\. \(2\) Riconoscimento — viene mostrata una lista mista target \+ distrattori; il giocatore indica per ciascuno se era presente nella lista originale \(risposta si'/no\)\. I distrattori variano da non correlati \(lv bassi\) a semanticamente simili e foneticamente vicini \(lv alti\)\.__

__Tabella livelli \(chiave\)__

__Lv__

__N item__

__Distrattori__

__Delay__

__Liste mult\.__

__Trial__

1

5

n\.correlati

immediato

no

5

6

7

semantici

30 s

no

6

12

10

semantici

120 s

sì

9

17

13

fon\.\+sem\.

180 s

sì \(B\+C\)

10

20

15

fon\.\+sem\.

300 s

sì \(B\+C\)

10

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

38

Memoria Lista — Parole semantiche

"parole\_semantiche"

39

Memoria Lista — Parole non correlate

"parole\_non\_correlate"

40

Memoria Lista — Numeri

"numeri"

41

Memoria Lista — Parole living

"parole\_living"

42

Memoria Lista — Parole non\-living

"parole\_non\_living"

43

Memoria Lista — Immagini

"immagine"

__Nota stimoli: per le varianti con immagini usare icone vettoriali flat — non fotografie\. Le icone devono essere chiare e riconoscibili a colpo d'occhio\. Ai livelli bassi affiancare il nome scritto sotto l'icona; il nome scompare ai livelli avanzati\. Dataset minimo: 300 icone, organizzate per categoria \(animali, cibo, oggetti casa, mezzi di trasporto, abbigliamento, natura\)\.__

__Metriche__

• Hit rate per trial \(% target riconosciuti\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 8\)__

\{"game":"memoria\_lista","level":8,"nWords":8,"distractorType":"semantici","stimulusType":"parole\_semantiche","delayS":60,"multipleLists":false,"trialsPerSession":7\}

## __Famiglia 10 — MEMORIA PROSPETTICA  \(giochi 44–46\)__

Il giocatore esegue un task secondario \(distrazione\) mentre deve ricordare di eseguire un'azione specifica quando compare un cue target \(event\-based\)\.

__Come funziona: all'inizio della sessione compare una schermata con l'istruzione prospettica mostrata per 5 secondi, es\. "Quando vedi una mela, tocca lo schermo due volte"\. Il giocatore poi svolge un compito distrattore \(es\. categorizzare immagini come animate/inanimate\)\. Il cue target compare occasionalmente tra gli stimoli del distrattore senza alcun avviso\. Il giocatore deve ricordare autonomamente di eseguire l'azione prospettica\. Variante time\-based \(gioco 45\): non c'e' cue visivo; il giocatore deve agire ogni N minuti stabiliti a inizio sessione tenendo traccia del tempo autonomamente\. A inizio ogni sessione mostrare sempre: istruzione \+ esempio animato breve \+ conferma "Ho capito" prima di avviare\.__

__Tabella livelli \(chiave\)__

__Lv__

__Tipo cue__

__Delay__

__Carico sec\.__

__Tipo task__

__Trial__

1

saliente

30 s

assente

event\-based

5

5

saliente

1 min

medio

event\-based

6

10

medio

2 min

alto

event\-based

8

15

m\.sottile

3 min

alto

time\-based

9

20

m\.sottile

5 min

massimo

misto

10

__Varianti — cueType__

__ID__

__Nome__

__stimulusType \(JSON\)__

44

Memoria Prospettica — Cue visivo saliente

"visivo\_saliente"

45

Memoria Prospettica — Cue semantico

"semantico"

46

Memoria Prospettica — Time\-based puro \(task prospettico time\-based dall'inizio\)

"time\_based"

__Metriche__

• Success rate per trial \(% task prospettico eseguito correttamente\)   • Ritardo risposta per trial \(ms tra onset cue e risposta\)

__JSON esempio \(lv 10\)__

\{"game":"memoria\_prospettica","level":10,"cueType":"visivo\_saliente","delayS":120,"secondaryTaskLoad":"alto","prospTaskType":"event\_based","trialsPerSession":8\}

## __Famiglia 11 — SART  \(gioco 47\)__

Sequenza rapida di stimoli \(cifre → lettere → simboli\)\. Risponde a tutto tranne al target raro \(commission error\)\. Misura la vigilanza prolungata e i lapse attentivi\.

__Come funziona: gli stimoli compaiono uno alla volta al centro dello schermo a ritmo costante\. Il giocatore tocca lo schermo per ogni stimolo \(go\)\. Quando compare il target raro deve trattenersi dal toccare \(no\-go\)\. Target raro: cifre lv 1\-11 = numero 3; lettere lv 12\-15 = lettera X; simboli lv 16\-20 = simbolo mostrato a inizio sessione, con mascheramento visivo dopo 250 ms\. Errori: commissione = toccare il target raro \(lapse attentivo\); omissione = non toccare uno stimolo normale\. Onboarding obbligatorio prima di ogni sessione: mostrare il target con illustrazione \+ regola "tocca tutto tranne \[target\]" \+ 5 trial di pratica con feedback\. __

__Tabella livelli \(chiave\)__

__Lv__

__N Stim\.__

__Freq\. target__

__ISI \(ms\)__

__Tipo stimolo__

__Mascheramento__

1

50

10%

1000

cifre

no

8

100

10%

650

cifre

no

12

130

5%

530

lettere

no

16

160

2%

420

simboli

sì

20

200

2%

300

simboli

sì

__Metriche__

• Accuratezza per trial \(% commission \+ omission corretti\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 8\)__

\{"game":"sart","level":8,"sequenceLength":90,"targetFrequency":0\.10,"isiMs":600,"stimulusType":"cifre","masking":false,"trialsPerSession":4\}

## __Famiglia 12 — GO/NO\-GO  \(giochi 48–50, 68\)__

Il giocatore risponde \(go\) agli stimoli target e inibisce \(no\-go\) agli altri\. Le 4 varianti differiscono per il tipo di discriminante: cromatico, semantico, multimodale, lessicale\.

__Tabella livelli \(chiave\) — Cromatico \(gioco 47, riferimento\)__

__Lv__

__N Col\. Target__

__ISI \(ms\)__

__Ratio Go:NoGo__

__T\. Risposta \(ms\)__

__Trial__

1

1

1500

75:25

1500

6

7

1

1100

70:30

900

8

12

2

750

65:35

700

9

16

3

600

60:40

580

10

20

3

500

50:50

500

10

*ℹ️  Gioco 48 \(Semantico\): la leva principale è la distanza semantica target\-distrattori \(distante → overlap\)\. Gioco 49 \(Multimodale\): modalità target visivo → audio → V\+A congruente → V\+A incongruente\. Gioco 68 \(Lessicale\): regola go=parole reali → go=non\-parole → alternata\.*

__Varianti__

__ID__

__Nome__

__stimulusType \(JSON\)__

48

Go/No\-Go — Cromatico

"cromatico"

49

Go/No\-Go — Semantico

"semantico"

50

Go/No\-Go — Multimodale

"multimodale"

68

Go/No\-Go — Lessicale

"lessicale"

__Metriche__

• Accuratezza per trial \(% commission \+ omission corretti\)   • RT trial go corretti \(ms onset stimolo → risposta\)

## __Famiglia 13 — DUAL TASK TAP  \(gioco 51\)__

Esecuzione simultanea di un task motorio \(tapping\) e un task cognitivo\. Il dual\-task cost misura la riduzione delle risorse attentive\.

__Come funziona: lo schermo e' diviso in due aree\. In basso la zona di tapping con metronomo visivo \(pulsazione luminosa\)\. In alto compaiono gli stimoli del task cognitivo a cui rispondere senza interrompere il tapping\. Task motorio: lv 1\-6 tapping semplice \(un'area, ritmo fisso\); lv 7\-11 pattern tap \(2\-3 zone in sequenza\); lv 12\-20 sequenza tap \(4\-6 zone, ritmo variabile\)\. Task cognitivo: lv 1\-6 riconoscimento parola \(si'/no\); lv 7\-11 calcolo semplice \(3 opzioni\); lv 12\-20 decisione lessicale \(parola reale o inventata\)\. Il sistema misura separatamente ritmo motorio e performance cognitiva; il dual\-task cost e' calcolato rispetto a una baseline singolo\-task nei primi 2 trial\. __

__Tabella livelli \(chiave\)__

__Lv__

__Task primario__

__Task secondario__

__Carico sec\.__

__Ritmo__

__Trial__

1

tapping

riconoscimento parola

basso

fisso

5

7

tapping

calcolo

medio

fisso

7

12

pattern tap

calcolo

alto

variabile

9

17

sequenza tap

decisione lessicale

alto

random

10

20

sequenza tap

decisione lessicale

molto alto

random

10

__Metriche__

• Accuratezza per trial   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"dual\_task\_tap","level":10,"primaryTask":"pattern\_tap","secondaryTask":"word\_recognition","secondaryLoad":"medio","rhythmType":"variabile","trialsPerSession":8\}

## __Famiglia 14 — VIGILANCE CLOCK  \(gioco 52\)__

Una lancetta avanza su un orologio analogico; il giocatore risponde ai 'salti doppi'\. Misura il decremento di vigilanza nel tempo\. Ispirato al Mackworth Clock Test \(1948\)\. Come funziona: una lancetta avanza su un orologio analogico di uno scatto regolare ogni secondo \(~6 gradi\)\. Il giocatore monitora la lancetta per tutta la sessione e tocca lo schermo ogni volta che fa un salto doppio \(~12 gradi in un colpo\)\. Ai livelli alti l'ampiezza del salto si riduce fino a 6 gradi, rendendo la distinzione molto sottile\. Lv 13–20: distrattori visivi animati ai bordi del quadrante\. Onboarding obbligatorio: tutorial animato 30 sec con 3 esempi di scatto normale e 3 di salto doppio \+ 3 prove di pratica con feedback prima dell'inizio\. 

__Tabella livelli \(chiave\)__

__Lv__

__Freq\. eventi critici__

__Ampiezza salto__

__Distrattori__

1

ogni 40 s

30°

no

7

ogni 55 s

20°

no

13

ogni 70 s

12°

sì

18

ogni 85 s

8°

sì

20

ogni 90 s

6°

sì

3

__Metriche__

• Accuratezza per trial \(% commission \+ omission corretti\)   • Timer trial \(riduzione progressiva al crescere del livello\)

## __Famiglia 15 — STROOP  \(giochi 53–54\)__

Gioco 52 Color\-Word Stroop: identificare il colore dell'inchiostro \(non leggere la parola scritta\) il colore dell'inchiostro ignorando il nome della parola\. Gioco 53 Spatial Stroop \(Simon Task\): rispondere alla direzione di una freccia ignorando la sua posizione spaziale\.

__Tabella livelli \(chiave\) — Color\-Word Stroop__

__Lv__

__Condizione__

__T\.Lim \(ms\)__

__N Stim\.__

__Tipo risposta__

__Trial__

1

congruente

5000

1

tap colore

6

6

mista

4000

1

tap colore

8

11

mista

3000

1

scelta fon\.

9

15

incongruente

2000

2

scelta fon\.

10

20

mista\+neutro

1500

4

scelta fon\.

10

*ℹ️  Spatial Stroop \(gioco 53\): la leva è la congruenza posizione\-direzione freccia\. ISI: 1500→500 ms\. N frecce flanker: 1 → 3\.*

__Metriche__

• Accuratezza per trial \(%\)   • Timer trial \(riduzione progressiva al crescere del livello\)

## __Famiglia 16 — TASK SWITCHING AB  \(gioco 55\)__

Il giocatore alterna tra due \(poi tre\) regole di classificazione\. Il cue regola è esplicito nei livelli bassi e implicito in quelli alti\. Ispirato a Rogers & Monsell \(1995\)\.

__Come funziona: ogni trial mostra uno stimolo con due pulsanti di risposta\. Il giocatore applica la regola attiva alternandola di trial in trial\. Esempio con numeri e due regole: Regola A = pari o dispari; Regola B = maggiore o minore di 5\. Lv 1\-10 \(cue esplicito\): prima di ogni trial compare un'icona che indica la regola attiva, il giocatore la legge poi risponde allo stimolo\. Lv 11\-20 \(cue implicito\): nessun cue; il giocatore ricorda e alterna autonomamente le regole\. Lv 15\-20: si aggiunge una terza regola e l'ISI scende a 400 ms, richiedendo una risposta molto rapida\. __

__Tabella livelli \(chiave\)__

__Lv__

__Cue__

__N Regole__

__ISI \(ms\)__

__Tipo stim\.__

__Trial__

1

esplicito

2

1500

numeri

6

7

esplicito

2

900

numeri

8

11

implicito

2

700

immagini

9

15

implicito

3

600

parole

10

20

implicito

3

400

parole

10

__Metriche__

• Accuratezza per trial \(switch vs ripetizione\)   • Timer trial \(riduzione progressiva al crescere del livello\)

## __Famiglia 17 — FLANKER TASK  \(gioco 56\)__

Risposta alla freccia centrale ignorando le frecce ai lati \(flanker\)\. Congruente = stessa direzione; incongruente = direzione opposta\. Ispirato a Eriksen & Eriksen \(1974\)\.

__Tabella livelli \(chiave\)__

__Lv__

__Congruenza__

__N Flanker__

__ISI \(ms\)__

__Tipo stim\.__

__Trial__

1

congruente

2

1500

frecce

6

8

mista

4

950

frecce

8

12

mista

4

750

lettere

9

15

incongruente

6

600

simboli

10

20

mista

6

400

simboli

10

__Metriche__

• Accuratezza per trial \(congruente vs incongruente\)   • Timer trial \(riduzione progressiva al crescere del livello\)

## __Famiglia 18 — PIANIFICAZIONE  \(giochi 57–58\)__

Gioco 56 Tower of London Light: spostare dischi colorati su pioli per raggiungere una configurazione target col minimo di mosse\. Gioco 57 Brixton Spatial Anticipation: anticipare la posizione successiva di un punto su una griglia 5×10 inferendo la regola di spostamento\.

__Tower of London: lo schermo mostra due configurazioni affiancate di dischi colorati su tre pioli: a sinistra la configurazione attuale, a destra l'obiettivo\. Il giocatore tocca un disco per selezionarlo e poi il piolo di destinazione per spostarlo\. Regola: si puo' muovere solo il disco in cima a ogni piolo; ogni piolo ha una capacita' massima\. Lv 1\-5: 1\-2 mosse minime, tempo illimitato\. Lv 10\-20: fino a 7 mosse, limite di tempo per la pianificazione \(il cronometro parte dalla prima mossa\)\. Brixton: una griglia 10x5 mostra un cerchio che si sposta\. Il giocatore tocca la casella dove prevede che andra' al passo successivo\. Il pattern segue una regola da inferire \(es\. sempre \+1 colonna\)\. La regola cambia senza avviso dopo 6\-8 risposte corrette consecutive\. Lv alti: regola condizionale \(es\. se il cerchio e' nell'ultima colonna torna alla prima, altrimenti avanza di 2\)\. __

__Tabella livelli \(chiave\) — Tower of London__

__Lv__

__N Dischi__

__Mosse min\.__

__T\. Pianif\. \(ms\)__

__Trial__

1

2

1

illimitato

4

5

3

2

illimitato

5

10

3

4

30000

7

15

4

5

22000

8

20

4

7

10000

10

*ℹ️  Brixton: complessità regola semplice lineare \(lv 1–7\) → media alternata \(lv 8–13\) → complessa condizionale \(lv 14–20\)\. Feedback: pieno → ridotto → nessuno\.*

__Metriche — Tower of London__

• Accuratezza mosse \(N mosse effettuate vs minime\)   • Tempo di pianificazione iniziale \(ms\)

__Metriche — Brixton__

• Accuratezza anticipazione per trial \(% previsioni corrette\)   • N trial per apprendere la regola dopo cambio

## __Famiglia 19 — VERBAL FLUENCY  \(giochi 59, 61–62\)__

Tre varianti di fluenza verbale con output verbale cronometrato\.

__Varianti__

__ID__

__Nome__

__stimulusType \(JSON\)__

59

Verbal Fluency — Alternata \(alterna 2 categorie: cat/cat → cat/fon → fon/fon\)

"alternata"

61

Verbal Fluency — Categoriale \(massimo numero di parole di una categoria\)

"categoriale"

62

Verbal Fluency — Fonemica \(parole che iniziano con una lettera specifica\)

"fonemica"

__Tabella livelli \(chiave\) — Fluency Alternata__

__Lv__

__Tipo alternanza__

__Distanza sem\.__

__Tempo \(s\)__

__Trial__

1

cat/cat

alta

30

4

7

cat/cat

media

60

6

11

cat/fon

alta

60

7

17

fon/fon

alta

75

8

20

fon/fon

bassa

90

8

__Metriche \(Verbal Fluency\)__

• N parole corrette generate \(\+ N errori regola\)   • Velocità produzione \(parole/minuto\)

## __Famiglia 20 — DCCS LIGHT  \(gioco 69\)__

Il giocatore classifica carte multidimensionali \(colore, forma, numero\) seguendo una regola che cambia automaticamente dopo N trial corretti consecutivi\. La sequenza delle regole è sempre fissa: **colore → forma → numero**\. L'interferenza è reale: il giocatore deve inibire la regola appena abbandonata e applicare quella nuova\. Ispirato al Dimensional Change Card Sort\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Tipo cue

Explicit \(lv 1–7\) → Icon \(lv 8–13\) → Nessuno \(lv 14–20\)

Trials before switch

5 → 1 trial corretti consecutivi

Sequenze per sessione

1 ciclo colore→forma→numero \(lv 1–13\) → 2 cicli \(lv 14–20\)

Tempo limite / trial

Assente \(lv 1–9\) → 5000 → 2000 ms

__Tabella livelli \(chiave\)__

__Lv__

__Cue__

__Trials before switch__

__Sequenze__

__T\.Lim \(ms\)__

1

explicit

5

1

—

4

explicit

4

1

—

7

explicit

3

1

—

8

icon

3

1

—

10

icon

3

1

5000

13

icon

2

1

3500

14

none

2

2

3500

17

none

2

2

2800

20

none

1

2

2000

__Metriche__

• Accuratezza per trial \(% carte classificate correttamente\)   • N trial per adattarsi alla regola dopo ogni cambio \(errori post\-switch\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"dccs\_light","level":10,"cueType":"icon","trialsBeforeSwitch":3,"sequencesPerSession":1,"timeLimitMs":5000,"trialsPerSession":8\}

## __Famiglia 21 — LINGUAGGIO & DENOMINAZIONE  \(giochi 63–67\)__

Cinque giochi che misurano accesso lessicale, elaborazione sintattica e memoria semantica culturale\.

__Varianti e meccaniche__

__ID__

__Nome__

__Meccanica__

__Leva principale__

63

Denominazione Rapida Speed

Denominare rapidamente immagini \(oggetti → azioni → astratti\)

Frequenza lessicale \+ T\.Lim

64

Lexical Decision

Decidere se una stringa è parola reale o non\-parola

Freq\. parole \+ tipo non\-parola \+ ISI

65

Sentence Anagram

Riordinare parole mescolate per formare una frase grammaticalmente corretta

Complessità sintattica \+ N parole

66

Semantic Relatedness

Decidere se due parole sono semanticamente correlate

Tipo relazione \+ modalità presentazione

67

Proverb Completion

Completare/spiegare/associare proverbi di familiarità decrescente

Frequenza culturale \+ tipo risposta

__Metriche comuni__

• Accuratezza per trial \(%\)   • Timer trial \(riduzione progressiva al crescere del livello\)

## __Famiglia 22 — MENTAL ROTATION  \(giochi 70–71\)__

Il giocatore vede due figure a orientamenti diversi e deve decidere se sono identiche o specchiate\. La difficoltà aumenta con l'angolo di rotazione, il numero di figure simultanee e la proporzione di distrattori specchiati\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

Angolo di rotazione

0–45° \(lv 1–5\) → 45–135° \(lv 6–14\) → 0–180° \(lv 15–20\)

N figure simultanee

1 \(lv 1–10\) → 2 \(lv 11–16\) → 4 \(lv 17–20\)

Mirror ratio

0% → 50% \(\+5% ogni 2 lv\)

Tempo limite / trial

Assente \(lv 1–9\) → 5000 → 2000 ms

__Tabella livelli \(chiave\)__

__Lv__

__N figure__

__Angolo__

__Mirror ratio__

__T\.Lim \(ms\)__

1

1

0–45°

0%

—

5

1

45–90°

20%

—

10

2

90–135°

40%

5000

15

2

135–180°

50%

3500

20

4

0–180°

50%

2000

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

70

Mental Rotation — Forme geometriche

"forme"

71

Mental Rotation — Oggetti 3D

"oggetti\_3d"

__Metriche__

• Accuratezza per trial \(corretto/errato\)   • RT per trial \(ms onset stimolo → risposta\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"mental\_rotation","level":10,"rotationAngle":"90-135","nFigures":2,"mirroredRatio":0\.40,"stimulusType":"forme","timeLimitMs":5000,"trialsPerSession":8\}

## __Famiglia 23 — FIGURE GROUND  \(giochi 72–73\)__

Il giocatore deve trovare e toccare una forma target nascosta in uno sfondo visivamente complesso\. La difficoltà aumenta con la complessità dello sfondo e la somiglianza tra figura e sfondo\. Adatto a utenti senior perché ricorda il formato "trova l'oggetto nascosto"\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

N target

1 \(lv 1–12\) → 2 \(lv 13–17\) → 3 \(lv 18–20\)

Complessità sfondo

Bassa → Media → Alta

Somiglianza figura\-sfondo

Bassa → Media → Alta

Tempo limite / trial

8000 → 2000 ms

__Tabella livelli \(chiave\)__

__Lv__

__N target__

__Complessità sfondo__

__Somiglianza__

__T\.Lim \(ms\)__

1

1

bassa

bassa

8000

5

1

media

bassa

6000

10

1

media

media

4500

15

2

alta

alta

3500

20

3

alta

alta

2000

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

72

Figure Ground — Forme

"forme"

73

Figure Ground — Oggetti/scene

"oggetti"

__Metriche__

• Accuratezza per trial \(% target trovati / N target\)   • RT per trial \(ms onset stimolo → prima risposta\)   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"figure\_ground","level":10,"nTargets":1,"backgroundComplexity":"media","figureSimilarity":"media","stimulusType":"forme","timeLimitMs":4500,"trialsPerSession":8\}

## __Famiglia 24 — BLOCK DESIGN  \(giochi 74–75\)__

Il giocatore deve ricostruire un pattern geometrico trascinando blocchi colorati nelle posizioni corrette\. Basato sul subtest Block Design del WAIS\. La difficoltà aumenta con il numero di blocchi, la complessità del pattern e la riduzione del tempo disponibile\.

__Parametri di difficoltà__

__Parametro__

__Range / Progressione__

N blocchi

4 \(lv 1–8\) → 9 \(lv 9–16\) → 16 \(lv 17–20\)

Complessità pattern

Semplice → Media → Alta

Tempo limite / trial

Illimitato \(lv 1–5\) → 30000 → 10000 ms

Hint disponibili

Completo \(lv 1–4\) → Parziale \(lv 5–9\) → Nessuno \(lv 10–20\)

__Tabella livelli \(chiave\)__

__Lv__

__N blocchi__

__Complessità__

__T\.Lim \(ms\)__

__Hint__

1

4

semplice

—

completo

5

4

media

—

parziale

9

9

media

30000

nessuno

15

9

alta

20000

nessuno

20

16

alta

10000

nessuno

__Varianti — stimulusType__

__ID__

__Nome__

__stimulusType \(JSON\)__

74

Block Design — Pattern colori

"colori"

75

Block Design — Pattern b/n

"bw"

__Metriche__

• Accuratezza mosse \(N mosse effettuate vs minimo teorico\)   • Tempo di completamento per trial   • Timer trial \(riduzione progressiva al crescere del livello\)

__JSON esempio \(lv 10\)__

\{"game":"block\_design","level":10,"nBlocks":9,"patternComplexity":"media","timeLimitMs":30000,"hints":"none","stimulusType":"colori","trialsPerSession":7\}

# __Appendice — Chiavi JSON di configurazione per famiglia__

Riepilogo di tutti i campi JSON usati nelle configurazioni dei giochi\.

__Famiglia__

__game \(string\)__

__Parametri chiave__

SEQUENCE TAP

sequence\_tap

sequenceLength, presentationSpeedMs, stimulusType, mode \[forward|backward|both\], timeLimitMs, trialsPerSession

RECALL GRID

recall\_grid

gridSize \[3x3\.\.6x6\], nStimuli, stimulusType, exposureDurationMs, delayMs, trialsPerSession

ODD ONE OUT

odd\_one\_out

nDistractors, similarity, discriminatingDimension, stimulusType, timeLimitMs, trialsPerSession

SORT IT

sort\_it

nCategories, stimuliPerCategory, ruleSwitchEveryN, primaryDimension, feedbackType \[full|reduced|none\], trialsPerSession

HAYLING GAME

hayling

sentenceType, mode \[A\_only|A\_and\_B|B\_only\], timeLimitMs, responseType \[multiple\_choice|free\_input\], trialsPerSession

PASAT LIGHT

pasat\_light

isiMs, digitType \[single|double\], sequenceLength, trialsPerSession

UPDATING WM

updating\_wm

sequenceLength, presentationSpeedMs, ruleType \[single|switching|switching\_3\], stimulusType, trialsPerSession

MEMORIA DI PROSA

memoria\_prosa

nSentences, delayS, recallType \[recognition|partial|free\], textType, trialsPerSession

MEMORIA LISTA

memoria\_lista

nWords, distractorType, stimulusType, delayS, multipleLists \[bool\], trialsPerSession

MEMORIA PROSPETTICA

memoria\_prospettica

cueType, delayS, secondaryTaskLoad \[none|low|medium|high|max\], prospTaskType \[event\_based|time\_based|mixed\], trialsPerSession

SART

sart

sequenceLength, targetFrequency \[0\.02\.\.0\.10\], isiMs, stimulusType, masking \[bool\], trialsPerSession

GO/NO\-GO

go\_nogo\_\[cromatico|semantico|multimodale|lessicale\]

Varia per variante

DUAL TASK

dual\_task\_tap

primaryTask, secondaryTask, secondaryLoad, rhythmType \[fixed|variable|random\], trialsPerSession

VIGILANCE

vigilance\_clock

criticalEventEveryS, jumpDegrees, visualDistractors \[bool\]

STROOP \(53\)

stroop\_color\_word

condition \[congruent|mixed|incongruent\], timeLimitMs, nSimultaneous, responseType, trialsPerSession

STROOP \(54\)

spatial\_stroop

congruency, isiMs, nArrows, trialsPerSession

TASK SWITCHING

task\_switching\_ab

cueType \[explicit|implicit\], nRules \[2|3\], isiMs, stimulusType, trialsPerSession

FLANKER

flanker\_task

congruency, nFlankers \[2|4|6\], isiMs, stimulusType, trialsPerSession

TOWER OF LONDON

tower\_of\_london

nDisks \[2|3|4\], minMoves, planningTimeLimitMs, trialsPerSession

BRIXTON

brixton

ruleComplexity \[simple|medium|complex\], elementsPerRule, feedback \[full|reduced|none\], trialsPerSession

VERBAL FLUENCY ALT\.

verbal\_fluency\_alternata

alternationType \[cat\_cat|cat\_fon|fon\_fon\], semanticDistance, timeLimitS, trialsPerSession

VERBAL FLUENCY CAT\.

verbal\_fluency\_categoriale

category, timeLimitS, hints \[bool\], trialsPerSession

VERBAL FLUENCY FON\.

verbal\_fluency\_fonemica

letter, timeLimitS, exclusions, trialsPerSession

DCCS LIGHT

dccs\_light

cueType \[explicit|icon|none\], trialsBeforeSwitch, sequencesPerSession \[1|2\], timeLimitMs, trialsPerSession

DENOMINATION SPEED

denomination\_speed

lexicalFrequency, timeLimitMs, stimulusType, phoneticHint \[bool\], trialsPerSession

LEXICAL DECISION

lexical\_decision

wordFrequency, nonWordType, isiMs, semanticPriming \[bool\], trialsPerSession

SENTENCE ANAGRAM

sentence\_anagram

nWords, syntacticComplexity, timeLimitMs, trialsPerSession

SEMANTIC RELATEDNESS

semantic\_relatedness

relationType, isiMs, presentationMode \[simultaneous|sequential\], trialsPerSession

PROVERB COMPLETION

proverb\_completion

proverbFrequency, responseType, distractorType, trialsPerSession

MENTAL ROTATION

mental\_rotation

rotationAngle, nFigures, mirroredRatio, stimulusType, timeLimitMs, trialsPerSession

FIGURE GROUND

figure\_ground

nTargets, backgroundComplexity, figureSimilarity, stimulusType, timeLimitMs, trialsPerSession

BLOCK DESIGN

block\_design

nBlocks \[4|9|16\], patternComplexity, timeLimitMs, hints \[full|partial|none\], stimulusType, trialsPerSession