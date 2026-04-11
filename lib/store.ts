import { create } from "zustand";
import { mockEserciziOggi } from "@/lib/mock-data";

export type CanalNotifica = "whatsapp" | "sms" | "email";
export type DimensioneTesto = "piccolo" | "normale" | "grande" | "molto grande";

export interface Familiare {
  id: string;
  nome: string;
  relazione: string;
  telefono: string;
  collegato_da: string;
  permessi: {
    attivita: boolean;
    medaglie: boolean;
    progressi: boolean;
  };
}

export interface UserState {
  isGuest: boolean;
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  anno_nascita: number;
  orario_notifica: string;
  canale_notifica: CanalNotifica;
  consenso_notifiche: boolean;
  // TODO: sostituire con query Supabase — SELECT dimensione_testo, alto_contrasto FROM preferenze WHERE user_id = ...
  dimensione_testo: DimensioneTesto;
  alto_contrasto: boolean;
  medaglie: string[];
  streak: number;
  esercizi_completati: number;
  familiari: Familiare[];
  // TODO: da Supabase — conteggio esercizi completati oggi per l'utente corrente
  eserciziFattiOggi: number;
  // flag cross-page: impostato da /esercizi per far aprire PausaAttivaView in /home
  pausaAttivaRichiesta: boolean;
  // timestamp (ms) di inizio pausa attiva — null = nessuna pausa in corso
  pausaAttivaInizio: number | null;
}

interface UserStore extends UserState {
  setUser: (data: Partial<UserState>) => void;
  aggiungiMedaglia: (id: string) => void;
  aggiornaFamiliare: (id: string, data: Partial<Familiare>) => void;
  rimuoviFamiliare: (id: string) => void;
  setPausaAttivaRichiesta: (v: boolean) => void;
  setPausaAttivaInizio: (v: number | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  // Dati utente di default
  isGuest: false,
  nome: "Mario",
  cognome: "",
  telefono: "+39 333 1234567",
  email: "",
  anno_nascita: 1955,
  orario_notifica: "09:00",
  canale_notifica: "whatsapp",
  consenso_notifiche: true,
  dimensione_testo: "normale",
  alto_contrasto: false,
  medaglie: ["prima-sfida", "tre-giorni", "dieci-esercizi"],
  streak: 7,
  esercizi_completati: 12,
  eserciziFattiOggi: mockEserciziOggi, // TODO: da Supabase
  pausaAttivaRichiesta: false,
  pausaAttivaInizio: null,

  // Familiari mock
  familiari: [
    {
      id: "sara",
      nome: "Sara",
      relazione: "Figlia",
      telefono: "+39 333 9876543",
      collegato_da: "15 giorni fa",
      permessi: { attivita: true, medaglie: true, progressi: true },
    },
    {
      id: "luca",
      nome: "Luca",
      relazione: "Nipote",
      telefono: "+39 347 1234567",
      collegato_da: "3 giorni fa",
      permessi: { attivita: true, medaglie: true, progressi: false },
    },
  ],

  setUser: (data) => set((s) => ({ ...s, ...data })),
  setPausaAttivaRichiesta: (v) => set({ pausaAttivaRichiesta: v }),
  setPausaAttivaInizio: (v) => set({ pausaAttivaInizio: v }),

  aggiungiMedaglia: (id) =>
    set((s) => ({
      medaglie: s.medaglie.includes(id) ? s.medaglie : [...s.medaglie, id],
    })),

  aggiornaFamiliare: (id, data) =>
    set((s) => ({
      familiari: s.familiari.map((f) =>
        f.id === id ? { ...f, ...data } : f
      ),
    })),

  rimuoviFamiliare: (id) =>
    set((s) => ({
      familiari: s.familiari.filter((f) => f.id !== id),
    })),
}));
