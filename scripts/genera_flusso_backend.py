"""
Genera img/FLUSSO_BACKEND.png: il percorso di una richiesta nel backend.

Dalla richiesta HTTP fino a PostgreSQL, un riquadro per cartella,
disposti in orizzontale da sinistra a destra.
Il sorgente modificabile a mano e' uml/10-flusso-backend.drawio.

Uso:  python scripts/genera_flusso_backend.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # nessuna finestra: salva e basta
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

# ── colori: stessi gruppi del diagramma Draw.io ──────────────────────────
ARANCIO, ARANCIO_FONDO = "#d79b00", "#ffe6cc"   # la richiesta che arriva
GIALLO, GIALLO_FONDO = "#d6b656", "#fff2cc"     # configurazione
VERDE, VERDE_FONDO = "#82b366", "#d5e8d4"       # il codice che lavora
ROSSO, ROSSO_FONDO = "#b85450", "#f8cecc"       # il database
GRIGIO = "#666666"
TESTO = "#0f172a"

SANS = "DejaVu Sans"
MONO = "DejaVu Sans Mono"

# (etichetta, descrizione su due righe, bordo, fondo, monospaziato)
PASSI = [
    ("richiesta\nHTTP", "", ARANCIO, ARANCIO_FONDO, False),
    ("app.js", "configura\nExpress", GIALLO, GIALLO_FONDO, True),
    ("routes/", "quale funzione\nper l'indirizzo?", VERDE, VERDE_FONDO, True),
    ("controllers/", "legge req,\nscrive res", VERDE, VERDE_FONDO, True),
    ("services/", "valida i dati,\napplica le regole", VERDE, VERDE_FONDO, True),
    ("config/\nprisma", "parla con\nil database", ROSSO, ROSSO_FONDO, True),
    ("PostgreSQL", "", ROSSO, ROSSO_FONDO, False),
]

# I riquadri scorrono da sinistra a destra, tutti alla stessa altezza.
LARG_BOX = 0.114               # larghezza di un riquadro
ALT_BOX = 0.400                # altezza di un riquadro
VUOTO = 0.030                  # spazio fra un riquadro e il successivo
Y_BOX = 0.400                  # bordo inferiore della fila


def main():
    fig, ax = plt.subplots(figsize=(13, 2.4))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    passo = LARG_BOX + VUOTO
    # centra la fila nella figura
    x = (1 - (len(PASSI) * LARG_BOX + (len(PASSI) - 1) * VUOTO)) / 2

    for i, (etichetta, descrizione, bordo, fondo, mono) in enumerate(PASSI):
        ax.add_patch(
            FancyBboxPatch(
                (x, Y_BOX), LARG_BOX, ALT_BOX,
                boxstyle="round,pad=0.004,rounding_size=0.012",
                linewidth=1.5, edgecolor=bordo, facecolor=fondo, zorder=3,
            )
        )
        centro_x = x + LARG_BOX / 2
        ax.text(
            centro_x, Y_BOX + ALT_BOX / 2, etichetta,
            ha="center", va="center", zorder=4,
            fontsize=10, fontweight="bold", color=TESTO,
            linespacing=1.4, family=MONO if mono else SANS,
        )

        # la descrizione sotto il riquadro
        if descrizione:
            ax.text(
                centro_x, Y_BOX - 0.065, descrizione,
                ha="center", va="top", zorder=4,
                fontsize=8, color=GRIGIO, linespacing=1.5, family=SANS,
            )

        # la freccia verso il riquadro successivo
        if i < len(PASSI) - 1:
            ax.add_patch(
                FancyArrowPatch(
                    (x + LARG_BOX, Y_BOX + ALT_BOX / 2),
                    (x + passo, Y_BOX + ALT_BOX / 2),
                    arrowstyle="-|>", mutation_scale=13,
                    linewidth=1.6, color=GRIGIO, zorder=2,
                )
            )

        x += passo

    destinazione = (Path(__file__).resolve().parent.parent
                    / "img" / "FLUSSO_BACKEND.png")
    destinazione.parent.mkdir(exist_ok=True)
    fig.savefig(destinazione, dpi=150, bbox_inches="tight",
                facecolor="white", pad_inches=0.3)
    print(f"Creato: {destinazione}")


if __name__ == "__main__":
    main()
