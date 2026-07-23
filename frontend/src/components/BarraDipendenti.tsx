type Props = {
  numeroSelezionati: number;
  onCrea: () => void;
  onEliminaSelezionati: () => void;
};

export default function BarraDipendenti({
  numeroSelezionati,
  onCrea,
  onEliminaSelezionati,
}: Props) {
  return (
    <header className="barra">
      <h2>Dipendenti</h2>

      <div className="azioni">
        <button className="btn primario" onClick={onCrea}>
          + Crea dipendente
        </button>

        {numeroSelezionati > 0 && (
          <button className="btn pericolo" onClick={onEliminaSelezionati}>
            Elimina selezionati ({numeroSelezionati})
          </button>
        )}
      </div>
    </header>
  );
}
