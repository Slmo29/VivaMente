import { create } from "zustand";

export type CanalNotifica = "whatsapp" | "sms" | "email";

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
  nome: string;
  cognome: string;
  telefono: string;
  email: string;
  anno_nascita: number;
  orario_notifica: string;
  canale_notifica: CanalNotifica;
  consenso_notifiche: boolean;
  medaglie: string[];
  streak: number;
  esercizi_completati: number;
  familiari: Familiare[];
}

interface UserStore extends UserState {
  setUser: (data: Partial<UserState>) => void;
  aggiungiMedaglia: (id: string) => void;
  aggiornaFamiliare: (id: string, data: Partial<Familiare>) => void;
  rimuoviFamiliare: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  // Dati utente di default
  nome: "Mario",
  cognome: "",
  telefono: "+39 333 1234567",
  email: "",
  anno_nascita: 1955,
  orario_notifica: "09:00",
  canale_notifica: "whatsapp",
  consenso_notifiche: true,
  medaglie: ["prima-sfida", "tre-giorni", "dieci-esercizi"],
  streak: 7,
  esercizi_completati: 12,

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
