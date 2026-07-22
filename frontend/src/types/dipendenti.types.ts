export type Ruolo = 'Admin' | 'Super_Admin' | 'Operatore';

export type TipoReparto =
  | 'Ufficio_Logistico'
  | 'Ufficio_Commerciale'
  | 'Ufficio_Amministrazione'
  | 'Ufficio_Informatico';

export const RUOLI: Ruolo[] = ['Admin', 'Super_Admin', 'Operatore'];

export const REPARTI: TipoReparto[] = [
  'Ufficio_Logistico',
  'Ufficio_Commerciale',
  'Ufficio_Amministrazione',
  'Ufficio_Informatico',
];

export type Reparto = {
  id: number;
  reparto: TipoReparto;
};

// Cosi' come arriva dal backend: i campi ci sono sempre,
// ma il valore puo' essere null.
export type Dipendente = {
  id: number;
  nome: string | null;
  cognome: string | null;
  ruolo: Ruolo;
  repartoId: number | null;
  reparto: Reparto | null;
};

// Cosa mandi tu al backend: l'id lo assegna il database,
// ruolo e reparto sono facoltativi.
export type NuovoDipendente = {
  nome: string;
  cognome: string;
  ruolo?: Ruolo;
  reparto?: TipoReparto;
};

// Per la modifica: ogni campo e' facoltativo.
export type ModificaDipendente = {
  nome?: string;
  cognome?: string;
  ruolo?: Ruolo;
  reparto?: TipoReparto | null;
};
