import Dialogo from './Dialogo';

// Chiede conferma prima di eliminare. Non elimina niente da solo:
// avvisa il genitore col callback onConferma e lui decide cosa fare.

type Props = {
  messaggio: string;
  onConferma: () => void;
  onAnnulla: () => void;
};

export default function ConfermaElimina({ messaggio, onConferma, onAnnulla }: Props) {
  return (
    <Dialogo titolo="Confermi l'eliminazione?" onChiudi={onAnnulla}>
      <p>{messaggio}</p>
      <p className="avviso">L'operazione non e' reversibile.</p>

      <div className="pulsanti">
        <button className="btn" onClick={onAnnulla}>
          Annulla
        </button>
        <button className="btn pericolo" onClick={onConferma}>
          Elimina
        </button>
      </div>
    </Dialogo>
  );
}
