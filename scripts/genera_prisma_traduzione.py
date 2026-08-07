"""
Genera img/PRISMA_TRADUZIONE.png: come Prisma traduce fra oggetti e tabelle.

Mostra il viaggio di andata e ritorno di  prisma.dipendenti.findMany():
a sinistra il codice JavaScript, a destra l'SQL e le righe, in mezzo Prisma.
Senza titolo né didascalie: il testo sta nel README, non nell'immagine.

Il sorgente modificabile a mano è uml/08-prisma-traduzione.drawio.

Uso:  python scripts/genera_prisma_traduzione.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # nessuna finestra: salva e basta
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

# ── colori: gli stessi delle tre colonne del diagramma Draw.io ────────────
VERDE = "#82b366"          # mondo JavaScript
VERDE_FONDO = "#eef7ec"
ARANCIO = "#d79b00"        # Prisma, il traduttore
ARANCIO_FONDO = "#fff4e6"
ROSSO = "#b85450"          # mondo PostgreSQL
ROSSO_FONDO = "#fdeeed"
TESTO = "#0f172a"
GRIGIO = "#94a3b8"

MONO = "DejaVu Sans Mono"
SANS = "DejaVu Sans"

# ── le tre colonne ────────────────────────────────────────────────────────
COLONNE = [
    (0.020, VERDE, VERDE_FONDO, "MONDO JAVASCRIPT", "si ragiona per oggetti"),
    (0.353, ARANCIO, ARANCIO_FONDO, "PRISMA", "il traduttore"),
    (0.686, ROSSO, ROSSO_FONDO, "MONDO POSTGRESQL", "si ragiona per righe"),
]
LARG_COL = 0.294

# ── i sei riquadri: (colonna, y, altezza, titolo, corpo, monospaziato) ────
RIQUADRI = [
    (0, 0.535, 0.185, "① scrivi questo",
     "const dip = await prisma\n  .dipendenti.findMany()", True),
    (1, 0.535, 0.185, "② Prisma traduce",
     "dallo schema sa quali\ncolonne ha la tabella,\nquindi le elenca tutte", False),
    (2, 0.535, 0.185, "③ al database arriva",
     "SELECT id, nome, cognome,\n  ruolo, repartoId\nFROM \"Dipendenti\";", True),
    (2, 0.145, 0.210, "④ il database risponde",
     " id | nome   | repartoId\n----+--------+----------\n  4 | Andrea |     2\n  5 | Mario  |     2", True),
    (1, 0.145, 0.210, "⑤ Prisma ritraduce",
     "ogni riga → un oggetto\ninteger → number\ntext → string\nNULL → null", False),
    (0, 0.145, 0.210, "⑥ nel codice torna",
     "[ { id: 4,\n    nome: 'Andrea',\n    repartoId: 2 },\n  { id: 5, … } ]", True),
]


def disegna_colonna(ax, x, bordo, fondo, titolo, sottotitolo):
    """Lo sfondo di una colonna, con la sua intestazione."""
    ax.add_patch(
        FancyBboxPatch(
            (x, 0.105), LARG_COL, 0.855,
            boxstyle="round,pad=0.008,rounding_size=0.012",
            linewidth=0, facecolor=fondo, zorder=1,
        )
    )
    centro = x + LARG_COL / 2
    ax.add_patch(
        FancyBboxPatch(
            (x + 0.018, 0.862), LARG_COL - 0.036, 0.078,
            boxstyle="round,pad=0.008,rounding_size=0.012",
            linewidth=1.8, edgecolor=bordo, facecolor="white", zorder=2,
        )
    )
    ax.text(centro, 0.918, titolo, ha="center", va="center", zorder=3,
            fontsize=11.5, fontweight="bold", color=bordo, family=SANS)
    ax.text(centro, 0.887, sottotitolo, ha="center", va="center", zorder=3,
            fontsize=9, color=GRIGIO, style="italic", family=SANS)


def disegna_riquadro(ax, col, y, alt, titolo, corpo, mono):
    """Un passaggio della traduzione."""
    x, bordo = COLONNE[col][0], COLONNE[col][1]
    ax.add_patch(
        FancyBboxPatch(
            (x + 0.018, y), LARG_COL - 0.036, alt,
            boxstyle="round,pad=0.008,rounding_size=0.012",
            linewidth=1.6, edgecolor=bordo, facecolor="white", zorder=2,
        )
    )
    sx = x + 0.034
    ax.text(sx, y + alt - 0.026, titolo, ha="left", va="center", zorder=3,
            fontsize=10, fontweight="bold", color=bordo, family=SANS)
    ax.text(sx, y + alt - 0.048, corpo, ha="left", va="top", zorder=3,
            fontsize=8.5, color=TESTO, linespacing=1.5,
            family=MONO if mono else SANS)


def freccia(ax, x1, x2, y, tratteggiata):
    ax.add_patch(
        FancyArrowPatch(
            (x1, y), (x2, y),
            arrowstyle="-|>", mutation_scale=15, linewidth=2.4,
            color=ARANCIO, zorder=4,
            linestyle="--" if tratteggiata else "-",
        )
    )


def main():
    fig, ax = plt.subplots(figsize=(12.5, 6.4))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    for x, bordo, fondo, titolo, sottotitolo in COLONNE:
        disegna_colonna(ax, x, bordo, fondo, titolo, sottotitolo)

    for col, y, alt, titolo, corpo, mono in RIQUADRI:
        disegna_riquadro(ax, col, y, alt, titolo, corpo, mono)

    # andata: verso destra, a metà altezza dei riquadri superiori
    y_and = 0.535 + 0.185 / 2
    freccia(ax, 0.020 + LARG_COL - 0.018, 0.353 + 0.018, y_and, False)
    freccia(ax, 0.353 + LARG_COL - 0.018, 0.686 + 0.018, y_and, False)
    ax.text(0.5, 0.775, "ANDATA — la domanda", ha="center", va="center",
            fontsize=10.5, fontweight="bold", color=ARANCIO, family=SANS)

    # ritorno: verso sinistra, tratteggiata come nelle sequenze UML
    y_rit = 0.145 + 0.210 / 2
    freccia(ax, 0.686 + 0.018, 0.353 + LARG_COL - 0.018, y_rit, True)
    freccia(ax, 0.353 + 0.018, 0.020 + LARG_COL - 0.018, y_rit, True)
    ax.text(0.5, 0.395, "RITORNO — la risposta", ha="center", va="center",
            fontsize=10.5, fontweight="bold", color=ARANCIO, family=SANS)

    destinazione = (Path(__file__).resolve().parent.parent
                    / "img" / "PRISMA_TRADUZIONE.png")
    destinazione.parent.mkdir(exist_ok=True)
    fig.savefig(destinazione, dpi=150, bbox_inches="tight",
                facecolor="white", pad_inches=0.3)
    print(f"Creato: {destinazione}")


if __name__ == "__main__":
    main()
