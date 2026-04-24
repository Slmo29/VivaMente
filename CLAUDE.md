# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (PWA disabled in dev)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture Overview

**VivaMente** is a Next.js 14 App Router PWA for cognitive training targeted at elderly Italian users, with a caregiver/family monitoring layer. The app is fully in Italian.

### Routing Structure

- `app/(app)/` — Protected main app: `home`, `esercizi`, `esercizi/[id]`, `progressi`, `profilo`, `messaggi`
- `app/onboarding/` — Auth flow: `registrati`, `accedi`, `istruzioni`, `demo`, `reward`
- `app/famiglia/` — Family/caregiver dashboard (authenticated senior-side)
- `app/famigliare/` — Caregiver view accessed via one-time token (no auth required)
- `app/auth/callback/` — Supabase magic link callback: exchanges code for session, creates user profile on first login

Root redirects to `/onboarding`.

**Middleware** (`middleware.ts`) protects routes `/home`, `/esercizi`, `/progressi`, `/profilo`, `/messaggi`, `/famiglia`. Guest access via `vm_guest=1` cookie bypasses auth check. Authenticated users on `/onboarding` are redirected to `/home`.

### Data Layer

> **Regola**: collegarsi **esclusivamente** al progetto Supabase con ID `vvxohvjyiqsesyockmcy`. Non usare, creare o referenziare altri progetti Supabase.

**Supabase** handles auth + PostgreSQL. Key tables:
- `users` — Senior user profiles; stores `current_streak INT`, `last_activity_date DATE`, `genere TEXT` (used in `/famigliare` for relationship label)
- `categorie` — Static lookup: `id` (slug), `nome`, `icona`, `colore`. 5 records: `memoria`, `attenzione`, `linguaggio`, `esecutive`, `visuospaziali`
- `sessioni` — Completed sessions: `score`, `accuratezza`, `durata`, `completato`, `categoria_id` (denormalized for analytics)
- `esercizi_del_giorno` — Per-user daily assignment: 5 rows/day (one per category), unique on `(user_id, data, categoria_id)`; rotation uses day-of-year mod pool size. **Da ridisegnare con le nuove specifiche esercizi.**
- `medaglie` — Streak-based medals with `giorni INT`; 11 records (1,2,3,7,10,14,28,50,100,200,365 days)
- `user_medaglie` — Join table tracking earned medals
- `familiari` — Linked caregivers with `permessi JSONB`; `collegato_at` is a timestamp (convert via `giorniDa()` in `lib/utils.ts`)
- `inviti` — One-time tokens for caregiver onboarding (7-day expiry)
- `messaggi` — Encouragement messages from caregiver to senior; `familiare_id` FK to `familiari`; insert policy is open (caregiver has no auth session)

> **Tabelle in attesa di ridisegno:** `esercizi` (rimossa logicamente, da droppare e ricreare), `user_levels` (logica adattiva da ridefinire). Non usare né referenziare queste tabelle finché le nuove specifiche non sono disponibili.

Row Level Security is enabled on all tables. Static tables (`categorie`, `medaglie`) have public read. Caregiver actions on `messaggi` and `familiari` go through Supabase RPC functions (`get_familiare_dashboard`, `invia_messaggio_familiare`) that accept a token parameter.

Two Supabase clients:
- `lib/supabase/client.ts` — Browser (use in Client Components)
- `lib/supabase/server.ts` — Server (use in Server Components / API routes)

### Sync Layer (`lib/sync.ts`)

All DB interactions. Key functions:

**Init / profile:**
- `createUserProfile(...)` — upserts `users` row; called from registration flow
- `initUserData(userId)` — fetches profile, medals, today's session count; used by `UserInit.tsx`

**Sessions & streak:**
- `salvaSessione(...)` — inserts into `sessioni`
- `aggiornaStreak(...)` — recalculates streak (reset if gap > 1 day), updates `users`
- `controllaNuoveMedaglie(...)` — checks newly earned medals, inserts into `user_medaglie`

**Daily exercises:**
- `fetchOrCreateEserciziDelGiorno(userId)` — reads or creates today's 5 exercises (1 per category); rotation = `(dayOfYear + categoryIndex) % poolSize`
- `marcaEsercizioCompletato(userId, esercizioId)` — updates `esercizi_del_giorno.completato`

**Dashboard / analytics:**
- `fetchProgressiSettimanali(userId)` — sessions grouped by day for current Mon–Sun week
- `fetchSessioniRecenti(userId)` — last 6 sessions with trend (crescita/stabile/calo)
- `fetchDatiProgressi(userId)` — full 30-day analytics for `/progressi` page: score per category, storico, totale settimana scorsa
- `fetchMessaggi(userId)` — last 20 messages with caregiver name/relation via FK join
- `segnaMessaggioLetto(messaggioId)` — marks message read

**Caregiver (token-based, no auth):**
- `fetchFamiliareDashboard(token)` — calls RPC `get_familiare_dashboard`
- `inviaMessaggioFamiliare(token, testo, categoria)` — calls RPC `invia_messaggio_familiare`

### State Management

Zustand store at `lib/store.ts` — **not persisted to localStorage** (data always fetched fresh from Supabase). Manages:

User profile fields: `userId`, `nome`, `cognome`, `telefono`, `email`, `anno_nascita`, `orario_notifica`, `canale_notifica`, `consenso_notifiche`

Runtime state:
- `streak`, `lastActivityDate`, `medaglie` (array di ID)
- `eserciziFattiOggi` — count of today's completed sessions
- `eserciziDelGiorno: EserciziDelGiornoItem[]` — today's 5 exercises with completion status
- `userLevels: Record<string, number>` — livello adattivo per categoria; **logica di aggiornamento da ridefinire**
- `progressiSettimanali: ProgressoGiorno[]` — weekly chart data
- `sessioniRecenti: SessioneRecente[]` — last 6 sessions for dashboard
- `familiari: Familiare[]`
- `messaggi: MessaggioReale[]`
- `pausaAttivaRichiesta: boolean` — cross-page flag set by `/esercizi` to open PausaAttivaView in `/home`
- `pausaAttivaInizio: number | null` — timestamp (ms) of active pause start; null = no pause active
- `navNascosta: boolean` — hides BottomNav (e.g. full-screen modals)
- `initialized: boolean`, `isGuest: boolean`

`components/UserInit.tsx` (Client Component in layout) initializes store from Supabase on mount. Guests (`isGuest: true`) skip fetch.

### Exercise System

> **Stato attuale: in ridisegno.** I game engine precedenti (`components/esercizi/`) sono stati rimossi. Le nuove famiglie di esercizi e la logica adattiva sono in attesa di specifiche.

La struttura invariata:
- 5 categorie cognitive (`memoria`, `attenzione`, `linguaggio`, `esecutive`, `visuospaziali`)
- Ogni giorno vengono proposti 5 esercizi, 1 per categoria (`esercizi_del_giorno`)
- La pagina esercizio (`app/(app)/esercizi/[id]/page.tsx`) gestisce i 3 stati: `intro → esercizio → risultato`; la sezione `esercizio` è attualmente un placeholder in attesa dei nuovi componenti

Quando i nuovi componenti saranno implementati, il game engine riceve `livello`, `tempoScaduto`, `onReady` e `onComplete(score, accuratezza)` dalla pagina.

### UI System

- Design tokens (category colors, difficulty styles) centralized in `lib/design-tokens.ts`
- Reusable components in `components/ui/` — use `btn.tsx` variants (`primary`, `secondary`, `outline`, `ghost`, `success`, `danger`) for all buttons
- `lib/mock-data.ts` — mock data ancora in uso nella pagina esercizio per dati di esercizio/categoria; da sostituire con dati Supabase quando le tabelle saranno ridisegnate
- Bottom navigation: `components/BottomNav.tsx` (4 tabs: Home, Esercizi, Progressi, Profilo); hidden when `navNascosta: true`

### Communications

- `lib/twilio.ts` — WhatsApp + SMS via Twilio (family notifications)
- `lib/resend.ts` — Email via Resend (magic links, invites)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`): on push to `main`, builds in CI and deploys to Hetzner Ubuntu via rsync + SSH. All env vars are injected from GitHub Secrets and written to `.env.local` on the server at each deploy. PM2 manages the Node process (`pm2 restart braintrainer`).
