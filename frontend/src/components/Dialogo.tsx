import type { ReactNode } from 'react';

// Il riquadro grigio che oscura la pagina, con la finestrella al centro.
// Non sa cosa contiene: il contenuto arriva da fuori tramite `children`.
// Cosi' lo riusano sia il form sia la conferma.

type Props = {
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
};

export default function Dialogo({ titolo, onChiudi, children }: Props) {
  return (
    // Click sul velo = chiudi
    <div className="velo" onClick={onChiudi}>
      {/* stopPropagation evita che il click DENTRO risalga al velo e chiuda */}
      <div className="riquadro" onClick={(e) => e.stopPropagation()}>
        <h3>{titolo}</h3>
        {children}
      </div>
    </div>
  );
}
