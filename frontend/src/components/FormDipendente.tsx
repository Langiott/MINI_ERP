import { useState } from 'react';
import Dialogo from './Dialogo';
import { RUOLI, REPARTI } from '../types/dipendenti.types';
import type { Dipendente, Ruolo, TipoReparto } from '../types/dipendenti.types';

// Serve sia a creare sia a modificare: cambia solo il valore iniziale.
//   dipendente = null  -> creazione
//   dipendente = {...} -> modifica

type Props = {
  dipendente: Dipendente | null;
  onSalva: (dati: {
    nome: string;
    cognome: string;
    ruolo: Ruolo;
    reparto: TipoReparto | null;
  }) => void;
  onAnnulla: () => void;
};

export default function FormDipendente({ dipendente, onSalva, onAnnulla }: Props) {
  // Lo stato del form vive QUI dentro: la pagina non deve saperne nulla.
  // Gli input HTML lavorano con stringhe, quindi '' significa "vuoto".
  const [nome, setNome] = useState(dipendente?.nome ?? '');
  const [cognome, setCognome] = useState(dipendente?.cognome ?? '');
  const [ruolo, setRuolo] = useState<Ruolo>(dipendente?.ruolo ?? 'Operatore');
  const [reparto, setReparto] = useState(dipendente?.reparto?.reparto ?? '');

  const invia = () => {
    onSalva({
      nome,
      cognome,
      ruolo,
      // '' dalla select significa "nessun reparto"
      reparto: reparto === '' ? null : (reparto as TipoReparto),
    });
  };

  return (
    <Dialogo
      titolo={dipendente ? 'Modifica dipendente' : 'Nuovo dipendente'}
      onChiudi={onAnnulla}
    >
      <label>
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>

      <label>
        Cognome
        <input value={cognome} onChange={(e) => setCognome(e.target.value)} />
      </label>

      <label>
        Ruolo
        <select value={ruolo} onChange={(e) => setRuolo(e.target.value as Ruolo)}>
          {RUOLI.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label>
        Reparto
        <select value={reparto} onChange={(e) => setReparto(e.target.value)}>
          <option value="">— nessuno —</option>
          {REPARTI.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div className="pulsanti">
        <button className="btn" onClick={onAnnulla}>
          Annulla
        </button>
        <button className="btn primario" onClick={invia}>
          Salva
        </button>
      </div>
    </Dialogo>
  );
}
