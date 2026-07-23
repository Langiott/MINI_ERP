import { useEffect, useState } from 'react';
import {
  aggiornaDipendente,
  creaDipendente,
  eliminaDipendente,
  eliminaDipendenti,
  getDipendenti,
} from '../api/dipendenti.api';
import type { DatiDipendente, Dipendente } from '../types/dipendenti.types';

export default function useDipendenti() {
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [errore, setErrore] = useState<string | null>(null);
  const [selezionati, setSelezionati] = useState<number[]>([]);
  const [formAperto, setFormAperto] = useState(false);
  const [inModifica, setInModifica] = useState<Dipendente | null>(null);
  const [daEliminare, setDaEliminare] = useState<Dipendente | null>(null);
  const [eliminazioneMultiplaAperta, setEliminazioneMultiplaAperta] = useState(false);

  const mostraErrore = (e: unknown) => {
    setErrore(e instanceof Error ? e.message : 'Si e\' verificato un errore');
  };

  const ricarica = async () => {
    try {
      setDipendenti(await getDipendenti());
      setErrore(null);
    } catch (e) {
      mostraErrore(e);
    }
  };

  useEffect(() => {
    void ricarica();
  }, []);

  const toggleUno = (id: number) => {
    setSelezionati((precedenti) =>
      precedenti.includes(id)
        ? precedenti.filter((selezionato) => selezionato !== id)
        : [...precedenti, id]
    );
  };

  const toggleTutti = () => {
    setSelezionati((precedenti) =>
      precedenti.length === dipendenti.length ? [] : dipendenti.map(({ id }) => id)
    );
  };

  const apriCreazione = () => {
    setInModifica(null);
    setFormAperto(true);
  };

  const apriModifica = (dipendente: Dipendente) => {
    setInModifica(dipendente);
    setFormAperto(true);
  };

  const chiudiForm = () => {
    setFormAperto(false);
    setInModifica(null);
  };

  const salva = async (dati: DatiDipendente) => {
    try {
      if (inModifica) {
        await aggiornaDipendente(inModifica.id, dati);
      } else {
        await creaDipendente({ ...dati, reparto: dati.reparto ?? undefined });
      }

      chiudiForm();
      await ricarica();
    } catch (e) {
      mostraErrore(e);
    }
  };

  const confermaEliminaUno = async () => {
    if (!daEliminare) return;

    try {
      await eliminaDipendente(daEliminare.id);
      setDaEliminare(null);
      await ricarica();
    } catch (e) {
      mostraErrore(e);
      setDaEliminare(null);
    }
  };

  const confermaEliminaMolti = async () => {
    try {
      await eliminaDipendenti(selezionati);
      setSelezionati([]);
      setEliminazioneMultiplaAperta(false);
      await ricarica();
    } catch (e) {
      mostraErrore(e);
      setEliminazioneMultiplaAperta(false);
    }
  };

  return {
    dipendenti,
    errore,
    selezionati,
    formAperto,
    inModifica,
    daEliminare,
    eliminazioneMultiplaAperta,
    toggleUno,
    toggleTutti,
    apriCreazione,
    apriModifica,
    chiudiForm,
    salva,
    apriEliminazioneSingola: setDaEliminare,
    annullaEliminazioneSingola: () => setDaEliminare(null),
    apriEliminazioneMultipla: () => setEliminazioneMultiplaAperta(true),
    annullaEliminazioneMultipla: () => setEliminazioneMultiplaAperta(false),
    confermaEliminaUno,
    confermaEliminaMolti,
  };
}
