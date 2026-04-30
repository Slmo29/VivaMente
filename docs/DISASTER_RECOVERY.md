# VivaMente — Disaster Recovery

**Ultima revisione:** 2026-04-30  
**Progetto:** VivaMente (braintrainer)  
**Responsabile tecnico:** team@ncodestudio.it

---

## Indice

1. [Accesso al sistema attuale](#1-accesso-al-sistema-attuale)
2. [Infrastruttura](#2-infrastruttura)
3. [Variabili d'ambiente](#3-variabili-dambiente)
4. [Servizi esterni](#4-servizi-esterni)
5. [Repository e deploy](#5-repository-e-deploy)
6. [Ripristino DB — progetto Supabase esistente](#6-ripristino-db--progetto-supabase-esistente)
7. [Ripristino DB — nuovo progetto Supabase](#7-ripristino-db--nuovo-progetto-supabase)
8. [Ripristino applicazione sul server](#8-ripristino-applicazione-sul-server)
9. [Checklist post-ripristino](#9-checklist-post-ripristino)
10. [Limitazioni note del backup](#10-limitazioni-note-del-backup)

---

## 1. Accesso al sistema attuale

Questa è la cosa più importante: se il progetto Supabase **esiste ancora**, tutto è già lì. Non serve eseguire nessun backup.

| Risorsa | Dove trovarlo |
|---|---|
| **Dashboard Supabase** | https://supabase.com/dashboard/project/vvxohvjyiqsesyockmcy |
| **Project ID** | `vvxohvjyiqsesyockmcy` |
| **Account Supabase** | Accedere con l'account Google/email di ncodestudio.it |
| **Repository GitHub** | https://github.com/Simone200000/braintrainer (o organizzazione ncodestudio) |
| **Server Hetzner** | Credenziali nei GitHub Secrets (vedi §3) |

> **Prima di qualsiasi ripristino:** verifica che il progetto Supabase esista ancora visitando il link sopra. Se esiste e risponde, l'app è viva — non serve fare nulla sul DB.

---

## 2. Infrastruttura

```
[Utente mobile]
      │ HTTPS
      ▼
[Server Hetzner — Ubuntu]
  • Next.js 14 (App Router, PWA)
  • Node 20, gestito da PM2 (processo: "braintrainer")
  • Porta: quella configurata in NEXT_PUBLIC_APP_URL
      │
      ▼
[Supabase — vvxohvjyiqsesyockmcy]
  • PostgreSQL con RLS
  • Auth (magic link via email)
  • 11 tabelle (vedi §6)
      │
      ├── [Resend] — invio magic link e inviti caregiver
      └── [Twilio] — WhatsApp/SMS notifiche caregiver
```

---

## 3. Variabili d'ambiente

Le variabili NON sono nel repository. Sono memorizzate come **GitHub Secrets** nel repository e vengono scritte automaticamente nel file `.env.local` sul server ad ogni deploy.

Per recuperarle:
1. Accedi a GitHub → repository → **Settings → Secrets and variables → Actions**
2. I segreti visibili (non i valori, solo i nomi) sono:

| Nome segreto | Descrizione |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del progetto Supabase (`https://vvxohvjyiqsesyockmcy.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave pubblica Supabase (anon key) |
| `NEXT_PUBLIC_APP_URL` | URL pubblico dell'app |
| `SERVER_HOST` | IP o hostname del server Hetzner |
| `SERVER_USER` | Utente SSH del server |
| `SERVER_SSH_KEY` | Chiave privata SSH per deploy |
| `SERVER_PORT` | Porta SSH (default 22) |
| `APP_DIR` | Percorso dell'app sul server (es. `/var/www/braintrainer`) |

> Le chiavi Supabase si trovano anche su: Dashboard Supabase → **Project Settings → API**  
> Usa sempre l'**anon key** (pubblica) per l'app. La **service_role key** è per operazioni admin (non nel codice, solo per emergenze manuali).

---

## 4. Servizi esterni

### Supabase Auth
Gli utenti si autenticano via **magic link** (email). Supabase Auth gestisce le sessioni. Non c'è password da recuperare — l'utente riceve sempre un link via email.

### Resend
- Servizio: https://resend.com
- Usato per: invio magic link + inviti caregiver
- Chiave: `RESEND_API_KEY` nei GitHub Secrets
- Se smette di funzionare: accedere a resend.com con l'account ncodestudio e verificare il dominio mittente

### Twilio
- Servizio: https://console.twilio.com
- Usato per: notifiche WhatsApp e SMS ai caregiver
- Chiavi: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` nei GitHub Secrets
- Non critico: se Twilio non funziona, l'app gira lo stesso (solo le notifiche sono disabilitate)

---

## 5. Repository e deploy

### Branch principali
| Branch | Scopo |
|---|---|
| `main` | Produzione — ogni push triggera il deploy automatico |
| `metis_alpha` | Sviluppo versione alleggerita — NON viene deployato automaticamente |

### Come funziona il deploy
1. Push su `main` → GitHub Actions si avvia
2. CI: installa dipendenze + `npm run build`
3. rsync dei file verso il server Hetzner
4. SSH: scrive `.env.local` sul server
5. SSH: `npm ci --omit=dev` + `pm2 restart braintrainer`

### Deploy manuale di emergenza
Se GitHub Actions non funziona, dal server:
```bash
cd $APP_DIR
git pull origin main
npm ci
npm run build
pm2 restart braintrainer
```

### Verificare che l'app giri
```bash
pm2 status            # verifica che "braintrainer" sia online
pm2 logs braintrainer # vedi log in tempo reale
```

---

## 6. Ripristino DB — progetto Supabase esistente

**Scenario:** qualcosa è andato storto nel DB ma il progetto Supabase esiste ancora.

### Opzione A — Ripristino da backup SQL
Il file `db_backup_2026-04-30.sql` nella root del repository contiene schema + RLS + funzioni + dati (vedi §10 per le limitazioni).

1. Apri la Dashboard Supabase → **SQL Editor**
2. Esegui le sezioni nell'ordine:
   - Sezione 1: `CREATE TABLE`
   - Sezione 2: `PRIMARY KEYS + UNIQUE`
   - Sezione 3: `CHECK CONSTRAINTS`
   - Sezione 4: `FOREIGN KEYS`
   - Sezione 5: `RLS ENABLE + POLICIES`
   - Sezione 6: `FUNZIONI RPC`
   - Sezione 7: `DATI — Tabelle statiche` (categorie, medaglie, esercizi)
   - Sezione 8: `DATI — Utenti` (solo se necessario; vedi §10)

> Le istruzioni `CREATE TABLE IF NOT EXISTS` e `CREATE OR REPLACE FUNCTION` sono idempotenti — eseguirle su tabelle già esistenti non causa errori.

### Opzione B — Punto di ripristino Supabase
Supabase Pro mantiene backup automatici per 7 giorni. Dashboard → **Database → Backups**.

---

## 7. Ripristino DB — nuovo progetto Supabase

**Scenario:** il progetto `vvxohvjyiqsesyockmcy` è stato cancellato o è irrecuperabile.

### Passi

1. **Crea nuovo progetto** su https://supabase.com (stesso account)
   - Nota il nuovo Project ID e URL

2. **Esegui il backup SQL** nell'SQL Editor del nuovo progetto (seguendo l'ordine del §6)

3. **Aggiorna le variabili d'ambiente:**
   - Vai su GitHub → Settings → Secrets
   - Aggiorna `NEXT_PUBLIC_SUPABASE_URL` con il nuovo URL
   - Aggiorna `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la nuova anon key

4. **Riabilita Auth:**
   - Dashboard nuovo progetto → **Authentication → Email**
   - Abilita "Enable Email Confirmations" se era attivo
   - Configura il dominio mittente su Resend e aggiornalo nella Dashboard Supabase → **Authentication → SMTP Settings**

5. **Rideploya l'app:**
   - Push qualsiasi modifica su `main` per triggerare GitHub Actions
   - Oppure deploy manuale (vedi §5)

6. **Gli utenti dovranno ri-registrarsi** (vedi §10 — limitazione critica)

---

## 8. Ripristino applicazione sul server

**Scenario:** il server Hetzner è inaccessibile o l'app non risponde.

### Verifica rapida
```bash
# Da qualsiasi macchina con accesso SSH
ssh $SERVER_USER@$SERVER_HOST

pm2 status                    # braintrainer deve essere "online"
pm2 logs braintrainer --lines 50   # cerca errori
```

### Riavvio PM2
```bash
pm2 restart braintrainer
# oppure, se il processo è scomparso:
cd $APP_DIR
pm2 start npm --name braintrainer --cwd $APP_DIR -- start
pm2 save
```

### Ricostruzione da zero (server nuovo)
1. Installa Node 20 e PM2 sul nuovo server
2. Clona il repository: `git clone <repo_url> $APP_DIR`
3. Crea manualmente `.env.local` con tutte le variabili (§3)
4. `npm ci && npm run build`
5. `pm2 start npm --name braintrainer --cwd $APP_DIR -- start && pm2 save`
6. Aggiorna `SERVER_HOST` (e altri segreti SSH) nei GitHub Secrets

---

## 9. Checklist post-ripristino

Dopo qualsiasi operazione di ripristino, verificare:

- [ ] L'app carica su `NEXT_PUBLIC_APP_URL`
- [ ] Il login via magic link funziona (ricevi l'email, il link apre la sessione)
- [ ] La home mostra gli esercizi del giorno
- [ ] Un esercizio si avvia e salva la sessione
- [ ] La pagina Progressi mostra i dati
- [ ] Il link caregiver (invito) funziona
- [ ] Le notifiche WhatsApp arrivano (test con numero reale)

---

## 10. Limitazioni note del backup

Il file `db_backup_2026-04-30.sql` è **sufficiente per ricreare lo schema e i dati statici** (categorie, medaglie, esercizi), ma presenta queste limitazioni:

### Limitazione critica — utenti
Gli UUID degli utenti in `users` sono legati alle identità in `auth.users` (layer interno Supabase, non esportabile con SQL standard). Su un **nuovo** progetto Supabase:
- Le righe di `users` possono essere inserite, ma non corrisponderanno a nessuna identità auth
- Gli utenti esistenti **non potranno accedere** ai propri dati storici
- Soluzione: gli utenti si re-registrano con la stessa email — il profilo viene ricreato vuoto

### Limitazione — dati utente
Le sessioni (52 righe), i livelli e le medaglie degli utenti sono inclusi nel backup ma dipendono dagli UUID auth. Importarli su un nuovo progetto è possibile solo se si riesce a esportare anche `auth.users` (richiede accesso `service_role` e strumenti pg_dump nativi).

### Cosa NON è nel backup
- Indici (ricreati automaticamente dai vincoli PK/UNIQUE)
- Trigger (non presenti nel progetto attuale)
- Storage Supabase (non usato attualmente)
- Dati di `messaggi` e `inviti` (tabelle operative, non incluse)

### Come fare un backup nativo completo (futuro)
Con la Supabase CLI installata:
```bash
supabase db dump -p <db_password> > backup_completo.sql
# La password DB si trova in: Dashboard → Project Settings → Database → Connection string
```
Questo produce un dump `pg_dump` nativo che include tutto, inclusi gli utenti auth se eseguito con `--data-only` sulla tabella `auth.users` tramite connessione diretta PostgreSQL.
