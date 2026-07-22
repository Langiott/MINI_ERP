import type { Dipendente } from '../types/dipendenti.types';

// Disegna e basta. Non chiama il backend, non decide niente:
// riceve i dati e avvisa il genitore quando l'utente clicca.

type Props = {
  dipendenti: Dipendente[];
  selezionati: number[];
  onToggleUno: (id: number) => void;
  onToggleTutti: () => void;
  onModifica: (d: Dipendente) => void;
  onElimina: (d: Dipendente) => void;
};

export default function TabellaDipendenti({
  dipendenti,
  selezionati,
  onToggleUno,
  onToggleTutti,
  onModifica,
  onElimina,
}: Props) {
  const tuttiSelezionati =
    dipendenti.length > 0 && selezionati.length === dipendenti.length;

  return (
    <table className="tabella">
      <thead>
        <tr>
          <th className="col-check">
            <input type="checkbox" checked={tuttiSelezionati} onChange={onToggleTutti} />
          </th>
          <th>ID</th>
          <th>Nome</th>
          <th>Cognome</th>
          <th>Ruolo</th>
          <th>Reparto</th>
          <th className="col-azioni">Azioni</th>
        </tr>
      </thead>

      <tbody>
        {dipendenti.map((d) => (
          <tr key={d.id} className={selezionati.includes(d.id) ? 'scelta' : ''}>
            <td className="col-check">
              <input
                type="checkbox"
                checked={selezionati.includes(d.id)}
                onChange={() => onToggleUno(d.id)}
              />
            </td>
            <td>{d.id}</td>
            <td>{d.nome ?? '—'}</td>
            <td>{d.cognome ?? '—'}</td>
            <td>
              <span className="etichetta">{d.ruolo}</span>
            </td>
            <td>{d.reparto?.reparto ?? '—'}</td>
            <td className="col-azioni">
              {/* La freccia serve: senza, la funzione partirebbe subito */}
              <button className="btn piccolo" onClick={() => onModifica(d)}>
                Modifica
              </button>
              <button className="btn piccolo pericolo" onClick={() => onElimina(d)}>
                Elimina
              </button>
            </td>
          </tr>
        ))}

        {dipendenti.length === 0 && (
          <tr>
            <td colSpan={7} className="vuoto">
              Nessun dipendente
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
