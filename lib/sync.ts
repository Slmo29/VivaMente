import { createClient } from "@/lib/supabase/client";

// ─── Tipi esportati ───────────────────────────────────────────────────────────

export interface MedagliaDefinizione {
  id: string;
  nome: string;
  giorni: number;
  guadagnata_at: string | null;
}

export async function fetchMedaglie(): Promise<MedagliaDefinizione[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("medaglie")
    .select("id, nome, giorni")
    .order("giorni", { ascending: true });
  return (data ?? []).map((m) => ({
    id: m.id as string,
    nome: m.nome as string,
    giorni: m.giorni as number,
    guadagnata_at: null,
  }));
}

export interface MessaggioReale {
  id: string;
  mittente: string;
  relazione: string;
  data: string;
  testo: string;
  letto: boolean;
}

export interface EserciziDelGiornoItem {
  id: string;
  titolo: string;
  categoria_id: string;
  livello: number;
  durata_stimata: number;
  completato: boolean;
  risultato: { tempo_secondi: number; accuratezza: number } | null;
}

export interface ProgressoGiorno {
  giorno: string;
  esercizi: number;
  memoria: number;
  attenzione: number;
  linguaggio: number;
  esecutive: number;
  visuospaziali: number;
}

export interface SessioneRecente {
  titolo: string;
  categoria: string;
  score: number;
  data: string;
  icona: string;
  trend: "crescita" | "stabile" | "calo";
}

export interface ScoreCategoria {
  categoria: string;
  icona: string;
  colore: string;
  score: number;
  trend: "crescita" | "stabile" | "calo";
  livello: number;
  sessioni: number;
  descrizione: string;
  storico: Array<{ label: string; score: number }>;
  storicoLivello: Array<{ label: string; livello: number }>;
}

export interface StoricoGiorno {
  data: string;
  sessioni: Array<{
    nome_esercizio: string;
    categoria: string;
    icona: string;
    livello: number;
    score: number;
  }>;
}

// ─── Costanti ────────────────────────────────────────────────────────────────

const CATEGORIE_ORDER = ["memoria", "attenzione", "linguaggio", "esecutive", "visuospaziali"] as const;

const ESERCIZI_POOL: Record<string, string[]> = {
  memoria:       ["sequence-tap-immagini", "recall-grid-numeri", "memoria-lista-parole", "updating-wm-numeri", "memoria-prosa-narrativi", "sequence-tap-parole", "memoria-lista-parole-semantiche", "sequence-tap-numeri"],
  attenzione:    ["pasat-light-single", "flanker-frecce", "sart-cifre", "vigilance", "odd-one-out-forme", "odd-one-out-numeri-lettere"],
  linguaggio:    ["linguaggio-semantic-relatedness", "linguaggio-naming", "verbal-fluency-categoriale", "linguaggio-proverb-completion", "linguaggio-lexical-decision"],
  esecutive:     ["dccs-light", "sort-it-colore", "task-switching-numeri", "hayling-quotidiano", "pianificazione-tol"],
  visuospaziali: ["block-design-colori", "mental-rotation-forme", "figure-ground-forme", "figure-ground-oggetti"],
};

const ICONE_CAT: Record<string, string> = {
  memoria: "brain", attenzione: "target", linguaggio: "chat",
  esecutive: "puzzle", visuospaziali: "eye",
};

const COLORI_CAT: Record<string, string> = {
  memoria: "#2563EB", attenzione: "#7C3AED", linguaggio: "#16A34A",
  esecutive: "#D97706", visuospaziali: "#0F766E",
};

const NOMI_CAT: Record<string, string> = {
  memoria: "Memoria", attenzione: "Attenzione", linguaggio: "Linguaggio",
  esecutive: "Esecutive", visuospaziali: "Visuospaziali",
};

function getDayOfYear(): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
}

// ─── Profilo utente ───────────────────────────────────────────────────────────

export async function createUserProfile({
  userId, nome, telefono, email, canale_notifica, orario_notifica, consenso_notifiche,
}: {
  userId: string; nome: string; telefono: string; email: string | null;
  canale_notifica: string; orario_notifica: string; consenso_notifiche: boolean;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("users").upsert({
    id: userId, nome, telefono, email: email || null,
    canale_notifica, orario_notifica: orario_notifica || "09:00",
    consenso_notifiche, current_streak: 0, last_activity_date: null,
  });
  if (error) throw error;
  const categorie = ["memoria", "attenzione", "linguaggio", "esecutive", "visuospaziali"];
  await supabase.from("user_levels").upsert(
    categorie.map((cat) => ({ user_id: userId, categoria_id: cat, livello_corrente: 1 })),
    { onConflict: "user_id,categoria_id", ignoreDuplicates: true }
  );
}

export async function initUserData(userId: string) {
  const supabase = createClient();

  const [{ data: profile }, { data: userMedaglie }, { count: eserciziFattiOggi }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("user_medaglie").select("medaglia_id, guadagnata_at").eq("user_id", userId),
      supabase
        .from("sessioni")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", new Date().toISOString().split("T")[0]),
    ]);

  if (!profile) return null;

  return {
    userId,
    nome: profile.nome as string,
    cognome: (profile.cognome ?? "") as string,
    telefono: (profile.telefono ?? "") as string,
    email: (profile.email ?? "") as string,
    anno_nascita: (profile.anno_nascita ?? 0) as number,
    orario_notifica: (profile.orario_notifica ?? "09:00") as string,
    canale_notifica: (profile.canale_notifica ?? "whatsapp") as import("@/lib/store").CanalNotifica,
    consenso_notifiche: (profile.consenso_notifiche ?? false) as boolean,
    streak: (profile.current_streak ?? 0) as number,
    lastActivityDate: (profile.last_activity_date ?? null) as string | null,
    medaglie: (userMedaglie ?? []).map((m) => m.medaglia_id as string),
    medaglieDate: Object.fromEntries((userMedaglie ?? []).map((m) => [m.medaglia_id as string, m.guadagnata_at as string])),
    eserciziFattiOggi: eserciziFattiOggi ?? 0,
    isGuest: false,
  };
}

// ─── Sessioni ─────────────────────────────────────────────────────────────────

export async function salvaSessione({
  userId, esercizioId, categoriaId, score,
}: {
  userId: string; esercizioId: string; categoriaId: string | null; score: number;
}) {
  const supabase = createClient();
  await supabase.from("sessioni").insert({
    user_id: userId,
    esercizio_id: esercizioId,
    categoria_id: categoriaId,
    score,
    accuratezza: score,
    completato: true,
  });
}

// ─── Streak e medaglie ────────────────────────────────────────────────────────

export async function aggiornaStreak(
  userId: string, streakCorrente: number, lastActivityDate: string | null
): Promise<number> {
  const supabase = createClient();
  const oggi = new Date().toISOString().split("T")[0];
  const ieri = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  if (lastActivityDate === oggi) return streakCorrente;

  const nuovoStreak = lastActivityDate === ieri ? streakCorrente + 1 : 1;

  await supabase
    .from("users")
    .update({ current_streak: nuovoStreak, last_activity_date: oggi })
    .eq("id", userId);

  return nuovoStreak;
}

export async function controllaNuoveMedaglie(
  userId: string, nuovoStreak: number, medaglieGiaOttenute: string[]
): Promise<string[]> {
  const supabase = createClient();

  let query = supabase.from("medaglie").select("id").lte("giorni", nuovoStreak);
  if (medaglieGiaOttenute.length > 0) {
    query = query.not("id", "in", `(${medaglieGiaOttenute.map((m) => `"${m}"`).join(",")})`);
  }

  const { data: nuove } = await query;
  if (!nuove || nuove.length === 0) return [];

  const ids = nuove.map((m) => m.id as string);
  await supabase.from("user_medaglie").insert(ids.map((id) => ({ user_id: userId, medaglia_id: id })));

  return ids;
}

// ─── Esercizi del giorno ──────────────────────────────────────────────────────

export async function fetchOrCreateEserciziDelGiorno(userId: string): Promise<EserciziDelGiornoItem[]> {
  const supabase = createClient();
  const oggi = new Date().toISOString().split("T")[0];

  // Verifica se esistono già per oggi
  const { data: existing } = await supabase
    .from("esercizi_del_giorno")
    .select("esercizio_id, categoria_id, completato")
    .eq("user_id", userId)
    .eq("data", oggi);

  const rows = (existing && existing.length > 0) ? existing : await createEserciziDelGiorno(supabase, userId, oggi);

  // Recupera i titoli dalla tabella esercizi
  const ids = rows.map((r: { esercizio_id: string }) => r.esercizio_id);
  const { data: info } = await supabase
    .from("esercizi")
    .select("id, titolo, livello, durata_stimata")
    .in("id", ids);

  const infoMap = Object.fromEntries((info ?? []).map((e) => [e.id, e]));

  return CATEGORIE_ORDER.map((cat) => {
    const row = rows.find((r: { categoria_id: string }) => r.categoria_id === cat);
    if (!row) return null;
    const details = infoMap[row.esercizio_id] ?? {};
    return {
      id: row.esercizio_id,
      titolo: details.titolo ?? row.esercizio_id,
      categoria_id: cat,
      livello: details.livello ?? 1,
      durata_stimata: details.durata_stimata ?? 60,
      completato: row.completato ?? false,
      risultato: null,
    } as EserciziDelGiornoItem;
  }).filter(Boolean) as EserciziDelGiornoItem[];
}

async function createEserciziDelGiorno(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  oggi: string
) {
  const dayOfYear = getDayOfYear();
  const toInsert = CATEGORIE_ORDER.map((cat, i) => {
    const pool = ESERCIZI_POOL[cat];
    return {
      user_id: userId,
      esercizio_id: pool[(dayOfYear + i) % pool.length],
      categoria_id: cat,
      data: oggi,
      completato: false,
    };
  });

  await supabase
    .from("esercizi_del_giorno")
    .upsert(toInsert, { onConflict: "user_id,data,categoria_id" });

  return toInsert.map((t) => ({ esercizio_id: t.esercizio_id, categoria_id: t.categoria_id, completato: false }));
}

export async function marcaEsercizioCompletato(userId: string, esercizioId: string): Promise<void> {
  const supabase = createClient();
  const oggi = new Date().toISOString().split("T")[0];
  await supabase
    .from("esercizi_del_giorno")
    .update({ completato: true })
    .eq("user_id", userId)
    .eq("esercizio_id", esercizioId)
    .eq("data", oggi);
}

// ─── Livelli utente ───────────────────────────────────────────────────────────

export async function fetchUserLevels(userId: string): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_levels")
    .select("categoria_id, livello_corrente")
    .eq("user_id", userId);

  if (!data) return {};
  return Object.fromEntries(data.map((r) => [r.categoria_id as string, r.livello_corrente as number]));
}

// ─── Dashboard data (home page) ───────────────────────────────────────────────

export async function fetchProgressiSettimanali(userId: string): Promise<ProgressoGiorno[]> {
  const supabase = createClient();

  // Lunedì della settimana corrente
  const now = new Date();
  const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("sessioni")
    .select("created_at, categoria_id")
    .eq("user_id", userId)
    .gte("created_at", monday.toISOString());

  const GIORNI_IT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  return GIORNI_IT.map((giorno, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const daySessions = (data ?? []).filter((s) =>
      new Date(s.created_at as string).toISOString().split("T")[0] === dateStr
    );

    const row: ProgressoGiorno = {
      giorno, esercizi: daySessions.length,
      memoria: 0, attenzione: 0, linguaggio: 0, esecutive: 0, visuospaziali: 0,
    };
    for (const s of daySessions) {
      const cat = s.categoria_id as string;
      if (cat && cat in row) (row as unknown as Record<string, number>)[cat]++;
    }
    return row;
  });
}

export async function fetchSessioniRecenti(userId: string): Promise<SessioneRecente[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("sessioni")
    .select("esercizio_id, categoria_id, score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!data || data.length === 0) return [];

  const oggi = new Date().toISOString().split("T")[0];
  const ieri = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Recupera titoli
  const ids = Array.from(new Set(data.map((s) => s.esercizio_id as string).filter(Boolean)));
  const { data: eInfo } = await supabase.from("esercizi").select("id, titolo").in("id", ids);
  const titoli = Object.fromEntries((eInfo ?? []).map((e) => [e.id, e.titolo]));

  return data.map((s, i) => {
    const sessionDate = new Date(s.created_at as string).toISOString().split("T")[0];
    const dataStr = sessionDate === oggi ? "Oggi" : sessionDate === ieri ? "Ieri"
      : `${Math.floor((Date.now() - new Date(s.created_at as string).getTime()) / 86400000)} giorni fa`;

    const prevScore = i < data.length - 1 ? (data[i + 1].score as number ?? 0) : (s.score as number ?? 0);
    const score = s.score as number ?? 0;
    const trend: "crescita" | "stabile" | "calo" = score > prevScore ? "crescita" : score < prevScore ? "calo" : "stabile";

    return {
      titolo: titoli[s.esercizio_id as string] ?? (s.esercizio_id as string) ?? "Esercizio",
      categoria: NOMI_CAT[s.categoria_id as string] ?? (s.categoria_id as string) ?? "",
      score,
      data: dataStr,
      icona: ICONE_CAT[s.categoria_id as string] ?? "brain",
      trend,
    };
  });
}

// ─── Messaggi ────────────────────────────────────────────────────────────────

export async function fetchMessaggi(userId: string): Promise<MessaggioReale[]> {
  const supabase = createClient();

  const oggi = new Date().toISOString().split("T")[0];
  const ieri = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const MESI_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

  const { data, error } = await supabase
    .from("messaggi")
    .select("id, testo, letto, created_at, familiari!messaggi_familiare_id_fkey(nome, relazione)")
    .eq("destinatario_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => {
    const dateStr = new Date(row.created_at as string).toISOString().split("T")[0];
    let dataFormattata: string;
    if (dateStr === oggi) dataFormattata = "Oggi";
    else if (dateStr === ieri) dataFormattata = "Ieri";
    else {
      const d = new Date(row.created_at as string);
      dataFormattata = `${d.getDate()} ${MESI_IT[d.getMonth()]}`;
    }

    const familiare = Array.isArray(row.familiari) ? row.familiari[0] : row.familiari;
    return {
      id: row.id as string,
      mittente: (familiare?.nome ?? "") as string,
      relazione: (familiare?.relazione ?? "") as string,
      data: dataFormattata,
      testo: row.testo as string,
      letto: row.letto as boolean,
    };
  });
}

export async function segnaMessaggioLetto(messaggioId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("messaggi")
    .update({ letto: true })
    .eq("id", messaggioId);
}

// ─── Dati progressi (pagina progressi) ───────────────────────────────────────

export async function fetchDatiProgressi(userId: string): Promise<{
  scoreCategorie: ScoreCategoria[];
  storicoSessioni: StoricoGiorno[];
  totaleSettimanaScorsa: number;
  progressiSettimanali: ProgressoGiorno[];
}> {
  const supabase = createClient();

  const trenta = new Date();
  trenta.setDate(trenta.getDate() - 30);

  const [
    { data: sessions },
    { data: levels },
    { data: sessSettScorsa },
  ] = await Promise.all([
    supabase
      .from("sessioni")
      .select("esercizio_id, categoria_id, score, created_at")
      .eq("user_id", userId)
      .gte("created_at", trenta.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("user_levels")
      .select("categoria_id, livello_corrente")
      .eq("user_id", userId),
    supabase
      .from("sessioni")
      .select("created_at, categoria_id")
      .eq("user_id", userId)
      .gte("created_at", (() => { const d = new Date(); d.setDate(d.getDate() - 14); return d.toISOString(); })())
      .lt("created_at", (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString(); })()),
  ]);

  const livelloMap = Object.fromEntries((levels ?? []).map((l) => [l.categoria_id as string, l.livello_corrente as number]));

  // Calcola giorni-sessione completi (5/5 categorie in un giorno) negli ultimi 30 giorni
  const daysCatMap: Record<string, Set<string>> = {};
  for (const s of (sessions ?? [])) {
    const day = new Date(s.created_at as string).toISOString().split("T")[0];
    if (!daysCatMap[day]) daysCatMap[day] = new Set();
    daysCatMap[day].add(s.categoria_id as string);
  }
  const completeDays = Object.keys(daysCatMap).filter((day) =>
    CATEGORIE_ORDER.every((cat) => daysCatMap[day].has(cat))
  );

  // Calcola giorni-sessione completi nella settimana precedente
  const prevDaysCatMap: Record<string, Set<string>> = {};
  for (const s of (sessSettScorsa ?? [])) {
    const day = new Date(s.created_at as string).toISOString().split("T")[0];
    if (!prevDaysCatMap[day]) prevDaysCatMap[day] = new Set();
    prevDaysCatMap[day].add(s.categoria_id as string);
  }
  const totaleSettimanaScorsa = Object.keys(prevDaysCatMap).filter((day) =>
    CATEGORIE_ORDER.every((cat) => prevDaysCatMap[day].has(cat))
  ).length;

  // Score categorie
  const scoreCategorie: ScoreCategoria[] = CATEGORIE_ORDER.map((cat) => {
    const catSessions = (sessions ?? []).filter((s) => s.categoria_id === cat);
    const score = catSessions.length > 0
      ? Math.round(catSessions.reduce((sum, s) => sum + (s.score as number ?? 0), 0) / catSessions.length)
      : 0;
    const livello = livelloMap[cat] ?? 1;

    // Trend: confronto ultimi 7 vs precedenti 7
    const now = Date.now();
    const ultimi7 = catSessions.filter((s) => Date.now() - new Date(s.created_at as string).getTime() < 7 * 86400000);
    const prec7 = catSessions.filter((s) => {
      const age = (now - new Date(s.created_at as string).getTime()) / 86400000;
      return age >= 7 && age < 14;
    });
    const avgUltimi = ultimi7.length > 0 ? ultimi7.reduce((sum, s) => sum + (s.score as number ?? 0), 0) / ultimi7.length : score;
    const avgPrec = prec7.length > 0 ? prec7.reduce((sum, s) => sum + (s.score as number ?? 0), 0) / prec7.length : avgUltimi;
    const trend: "crescita" | "stabile" | "calo" = avgUltimi > avgPrec + 2 ? "crescita" : avgUltimi < avgPrec - 2 ? "calo" : "stabile";

    // Storico score: raggruppa per giorno
    const byDay: Record<string, number[]> = {};
    for (const s of catSessions) {
      const day = new Date(s.created_at as string).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
      (byDay[day] = byDay[day] ?? []).push(s.score as number ?? 0);
    }
    const storico = Object.entries(byDay).map(([label, scores]) => ({
      label,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));

    return {
      categoria: NOMI_CAT[cat] ?? cat,
      icona: ICONE_CAT[cat] ?? "brain",
      colore: COLORI_CAT[cat] ?? "#2563EB",
      score,
      trend,
      livello,
      sessioni: completeDays.length,
      descrizione: `${NOMI_CAT[cat] ?? cat} al ${score}%`,
      storico,
      storicoLivello: storico.length > 0
        ? storico.map((s) => ({ label: s.label, livello }))
        : [{ label: "Oggi", livello }],
    };
  });

  // Storico per giorno (ultimi 30 giorni)
  const giornoMap: Record<string, StoricoGiorno["sessioni"]> = {};
  for (const s of (sessions ?? [])) {
    const day = new Date(s.created_at as string).toISOString().split("T")[0];
    (giornoMap[day] = giornoMap[day] ?? []).push({
      nome_esercizio: s.esercizio_id as string ?? "Esercizio",
      categoria: NOMI_CAT[s.categoria_id as string] ?? (s.categoria_id as string) ?? "",
      icona: ICONE_CAT[s.categoria_id as string] ?? "brain",
      livello: 1,
      score: s.score as number ?? 0,
    });
  }
  const storicoSessioni: StoricoGiorno[] = Object.entries(giornoMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([data, sessioni]) => ({ data, sessioni }));

  // Progressi settimanali (riusa la funzione)
  const progressiSettimanali = await fetchProgressiSettimanali(userId);

  return {
    scoreCategorie,
    storicoSessioni,
    totaleSettimanaScorsa: totaleSettimanaScorsa ?? 0,
    progressiSettimanali,
  };
}

// ─── Inviti familiari ─────────────────────────────────────────────────────────

export async function creaInvito({
  userId, nome, contatto, relazione,
}: {
  userId: string; nome: string; contatto: string; relazione: string;
}): Promise<string> {
  const supabase = createClient();
  const token = Math.random().toString(36).slice(2, 10).toUpperCase() +
                Math.random().toString(36).slice(2, 10).toUpperCase();
  await supabase.from("inviti").insert({
    token,
    mittente_id: userId,
    nome_destinatario: nome,
    contatto,
    relazione,
    status: "pending",
  });
  return token;
}

// ─── Familiare (accesso via token, senza auth) ────────────────────────────────

export interface FamiliareDashboard {
  senior: { nome: string; genere: "M" | "F" | null; current_streak: number };
  invito: { relazione: string; nome_destinatario: string };
  familiare_id: string;
  esercizi_oggi: Array<{ esercizio_id: string; categoria_id: string; completato: boolean }>;
  sessioni_recenti: Array<{ categoria_id: string; score: number; created_at: string }>;
  messaggi_inviati: Array<{ id: string; testo: string; letto: boolean; created_at: string; categoria: string }>;
  error?: string;
}

export async function fetchFamiliareDashboard(token: string): Promise<FamiliareDashboard | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_familiare_dashboard", { p_token: token });
  if (error || !data || data.error) return null;
  return data as FamiliareDashboard;
}

export async function inviaMessaggioFamiliare(token: string, testo: string, categoria: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("invia_messaggio_familiare", {
    p_token: token,
    p_testo: testo,
    p_categoria: categoria,
  });
  if (error || !data?.success) return false;
  return true;
}
