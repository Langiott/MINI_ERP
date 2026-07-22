import { useState, useEffect } from 'react';
import TabellaDipendenti from '../components/TabellaDipendenti';
import FormDipendente from '../components/FormDipendente';
import ConfermaElimina from '../components/ConfermaElimina';
import {
  getDipendenti,
  creaDipendente,
  aggiornaDipendente,
  eliminaDipendente,
  eliminaDipendenti,
} from '../api/dipendenti.api';
import type { Dipendente, Ruolo, TipoReparto } from '../types/dipendenti.types';

export default function DipendentiPage() {
  // I dati
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [errore, setErrore] = useState<string | null>(null);

  // Le righe spuntate
  const [selezionati, setSelezionati] = useState<number[]>([]);

  // Cosa e' aperto a schermo. null = niente aperto.
  const [formAperto, setFormAperto] = useState(false);
  const [inModifica, setInModifica] = useState<Dipendente | null>(null);
  const [daEliminare, setDaEliminare] = useState<Dipendente | null>(null);
  const [eliminaSelezionati, setEliminaSelezionati] = useState(false);

  const ricarica = async () => {
    try {
      setDipendenti(await getDipendenti());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  };

  // L'array vuoto: esegui una volta sola, all'apertura della pagina.
  useEffect(() => {
    ricarica();
  }, []);

  // Un array NUOVO ogni volta: React confronta i riferimenti,
  // quindi modificare quello esistente non farebbe ridisegnare nulla.
  const toggleUno = (id: number) =>
    setSelezionati((prec) =>
      prec.includes(id) ? prec.filter((x) => x !== id) : [...prec, id]
    );

  const toggleTutti = () =>
    setSelezionati((prec) =>
      prec.length === dipendenti.length ? [] : dipendenti.map((d) => d.id)
    );

  const apriCreazione = () => {
    setInModifica(null);
    setFormAperto(true);
  };

  const apriModifica = (d: Dipendente) => {
    setInModifica(d);
    setFormAperto(true);
  };

  const chiudiForm = () => {
    setFormAperto(false);
    setInModifica(null);
  };

  // Riceve i dati gia' pronti dal form.
  const salva = async (dati: {
    nome: string;
    cognome: string;
    ruolo: Ruolo;
    reparto: TipoReparto | null;
  }) => {
    try {
      if (inModifica) {
        // In modifica null e' valido: significa "togli il reparto".
        await aggiornaDipendente(inModifica.id, dati);
      } else {
        // In creazione il campo si omette: undefined, non null.
        await creaDipendente({ ...dati, reparto: dati.reparto ?? undefined });
      }
      chiudiForm();
      await ricarica();
    } catch (e) {
      setErrore((e as Error).message);
    }
  };

  const confermaEliminaUno = async () => {
    if (!daEliminare) return;
    try {
      await eliminaDipendente(daEliminare.id);
      setDaEliminare(null);
      await ricarica();
    } catch (e) {
      setErrore((e as Error).message);
      setDaEliminare(null);
    }
  };

  const confermaEliminaMolti = async () => {
    try {
      await eliminaDipendenti(selezionati);
      setSelezionati([]);
      setEliminaSelezionati(false);
      await ricarica();
    } catch (e) {
      setErrore((e as Error).message);
      setEliminaSelezionati(false);
    }
  };

  return (
    <div className="pagina">
      <header className="barra">
        <h2>Dipendenti</h2>

        <div className="azioni">
          <button className="btn primario" onClick={apriCreazione}>
            + Crea dipendente
          </button>

          {/* {condizione && <jsx>} = mostra solo se */}
          {selezionati.length > 0 && (
            <button
              className="btn pericolo"
              onClick={() => setEliminaSelezionati(true)}
            >
              Elimina selezionati ({selezionati.length})
            </button>
          )}
        </div>
      </header>

      {errore && <p className="errore">{errore}</p>}

      <TabellaDipendenti
        dipendenti={dipendenti}
        selezionati={selezionati}
        onToggleUno={toggleUno}
        onToggleTutti={toggleTutti}
        onModifica={apriModifica}
        onElimina={setDaEliminare}
      />

      {formAperto && (
        <FormDipendente
          dipendente={inModifica}
          onSalva={salva}
          onAnnulla={chiudiForm}
        />
      )}

      {daEliminare && (
        <ConfermaElimina
          messaggio={`Stai per eliminare ${daEliminare.nome ?? ''} ${
            daEliminare.cognome ?? ''
          }.`}
          onConferma={confermaEliminaUno}
          onAnnulla={() => setDaEliminare(null)}
        />
      )}

      {eliminaSelezionati && (
        <ConfermaElimina
          messaggio={`Stai per eliminare ${selezionati.length} dipendenti.`}
          onConferma={confermaEliminaMolti}
          onAnnulla={() => setEliminaSelezionati(false)}
        />
      )}
    </div>
  );
}
