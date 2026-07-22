import type {
  Dipendente,
  NuovoDipendente,
  ModificaDipendente,
} from '../types/dipendenti.types';


const BASE = '/api/dipendenti';

async function gestisciRisposta(res: Response) {
  if (!res.ok) {
    const corpo = await res.json().catch(() => ({}));
    throw new Error(corpo.error || `Errore ${res.status}`);
  }
  return res.json();
}

// GET /api/dipendenti
export async function getDipendenti(): Promise<Dipendente[]> {
  const res = await fetch(BASE);
  return gestisciRisposta(res);
}

// GET /api/dipendenti/:id
export async function getDipendente(id: number): Promise<Dipendente> {
  const res = await fetch(`${BASE}/${id}`);
  return gestisciRisposta(res);
}

// POST /api/dipendenti
export async function creaDipendente(dati: NuovoDipendente): Promise<Dipendente> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  });
  return gestisciRisposta(res);
}

// PUT /api/dipendenti/:id
export async function aggiornaDipendente(
  id: number,
  dati: ModificaDipendente
): Promise<Dipendente> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  });
  return gestisciRisposta(res);
}

// DELETE /api/dipendenti/:id
export async function eliminaDipendente(id: number): Promise<Dipendente> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return gestisciRisposta(res);
}

// DELETE /api/dipendenti  con body { ids: [...] }
export async function eliminaDipendenti(ids: number[]): Promise<{ eliminati: number }> {
  const res = await fetch(BASE, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return gestisciRisposta(res);
}
