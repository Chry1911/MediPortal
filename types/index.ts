// types/index.ts
// Tipi TypeScript condivisi in tutto il progetto

export type Ruolo = "PAZIENTE" | "MEDICO" | "ADMIN";
export type StatoPrenotazione = "IN_ATTESA" | "CONFERMATA" | "ANNULLATA" | "COMPLETATA";
export type StatoPagamento = "DA_PAGARE" | "PAGATO" | "RIMBORSATO" | "SCADUTO";
export type StatoReferto = "IN_ELABORAZIONE" | "DISPONIBILE" | "ARCHIVIATO";

export interface UtenteSession {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: Ruolo;
}

export interface PrestazioneDTO {
  id: string;
  codice: string;
  nome: string;
  descrizione?: string;
  reparto: string;
  durata: number;
  costo: number;
}

export interface PrenotazioneDTO {
  id: string;
  codice: string;
  dataOra: string;
  stato: StatoPrenotazione;
  note?: string;
  prestazione: PrestazioneDTO;
  paziente: { nome: string; cognome: string; email: string };
  medico: { nome: string; cognome: string };
  pagamento?: PagamentoDTO;
  referto?: RefertoDTO;
}

export interface PagamentoDTO {
  id: string;
  importo: number;
  stato: StatoPagamento;
  metodoPagamento?: string;
  dataScadenza: string;
  dataPagamento?: string;
  ricevutaUrl?: string;
}

export interface RefertoDTO {
  id: string;
  titolo: string;
  descrizione?: string;
  fileUrl: string;
  stato: StatoReferto;
  dataUpload?: string;
  medico: { nome: string; cognome: string };
}

export interface DashboardStats {
  incassiTotali: number;
  prenotazioniTotali: number;
  pagamentiCompletati: number;
  tassoIncasso: number;
  incassiPerMese: { mese: string; incasso: number }[];
  prestazioniTop: { nome: string; count: number; incasso: number }[];
  repartiStats: { reparto: string; count: number }[];
}
