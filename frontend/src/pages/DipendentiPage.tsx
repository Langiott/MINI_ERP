import BarraDipendenti from '../components/BarraDipendenti';
import ConfermaElimina from '../components/ConfermaElimina';
import FormDipendente from '../components/FormDipendente';
import TabellaDipendenti from '../components/TabellaDipendenti';
import useDipendenti from '../hooks/useDipendenti';

export default function DipendentiPage() {
  const {
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
    apriEliminazioneSingola,
    annullaEliminazioneSingola,
    apriEliminazioneMultipla,
    annullaEliminazioneMultipla,
    confermaEliminaUno,
    confermaEliminaMolti,
  } = useDipendenti();

  return (
    <div className="pagina">
      <BarraDipendenti
        numeroSelezionati={selezionati.length}
        onCrea={apriCreazione}
        onEliminaSelezionati={apriEliminazioneMultipla}
      />

      {errore && <p className="errore">{errore}</p>}

      <TabellaDipendenti
        dipendenti={dipendenti}
        selezionati={selezionati}
        onToggleUno={toggleUno}
        onToggleTutti={toggleTutti}
        onModifica={apriModifica}
        onElimina={apriEliminazioneSingola}
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
          onAnnulla={annullaEliminazioneSingola}
        />
      )}

      {eliminazioneMultiplaAperta && (
        <ConfermaElimina
          messaggio={`Stai per eliminare ${selezionati.length} dipendenti.`}
          onConferma={confermaEliminaMolti}
          onAnnulla={annullaEliminazioneMultipla}
        />
      )}
    </div>
  );
}
