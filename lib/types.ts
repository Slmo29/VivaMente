export type CanalNotifica = "whatsapp" | "sms" | "email";
export type Difficolta = "facile" | "medio" | "difficile";
export type TipoMedaglia = "streak" | "completamento" | "categoria" | "speciale";

export interface User {
  id: string;
  nome: string;
  telefono: string | null;
  email: string | null;
  anno_nascita: number | null;
  orario_notifica: string;
  canale_notifica: CanalNotifica;
  consenso_notifiche: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icona: string;
  descrizione: string | null;
  colore: string | null;
}

export interface Esercizio {
  id: string;
  categoria_id: string;
  titolo: string;
  descrizione: string | null;
  difficolta: Difficolta;
  durata_stimata: number | null;
  beneficio: string | null;
  config: Record<string, unknown>;
  attivo: boolean;
  created_at: string;
  categoria?: Categoria;
}

export interface Sessione {
  id: string;
  user_id: string;
  esercizio_id: string;
  score: number;
  durata: number;
  completato: boolean;
  created_at: string;
  esercizio?: Esercizio;
}

export interface Medaglia {
  id: string;
  nome: string;
  descrizione: string | null;
  icona: string | null;
  tipo: TipoMedaglia;
  condizione: Record<string, unknown>;
  created_at: string;
}

export interface UserMedaglia {
  id: string;
  user_id: string;
  medaglia_id: string;
  guadagnata_at: string;
  medaglia?: Medaglia;
}

export interface EsercizioDelGiorno {
  id: string;
  esercizio_id: string;
  data: string;
  esercizio?: Esercizio;
}
