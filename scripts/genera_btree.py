"""
Genera img/BTREE.png: come PostgreSQL cerca un dipendente per id.

Disegna l'indice B-tree sulla chiave primaria di Dipendenti e evidenzia
il cammino percorso da  SELECT * FROM "Dipendenti" WHERE id = 42.

Uso:  python scripts/genera_btree.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # nessuna finestra: salva e basta
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

# ── colori ────────────────────────────────────────────────────────────────
BLU = "#1d4ed8"        # nodi sul cammino della ricerca
BLU_CHIARO = "#dbeafe"
GRIGIO = "#94a3b8"     # nodi non visitati
GRIGIO_CHIARO = "#f1f5f9"
ARANCIO = "#ea580c"    # la riga trovata
TESTO = "#0f172a"

# ── struttura dell'albero ─────────────────────────────────────────────────
# (x, y, etichetta, sul_cammino)
NODI = [
    # radice
    (0.520, 0.80, "30 | 60", True),
    # nodi interni
    (0.220, 0.52, "10 | 20", False),
    (0.520, 0.52, "40 | 50", True),
    (0.820, 0.52, "70 | 80", False),
    # foglie — sei riquadri equidistanti, senza sovrapposizioni
    (0.145, 0.20, "1..9", False),
    (0.295, 0.20, "11..19", False),
    (0.445, 0.20, "31..39", False),
    (0.595, 0.20, "41..49", True),
    (0.745, 0.20, "61..69", False),
    (0.895, 0.20, "71..79", False),
]

ARCHI = [
    (0, 1, False), (0, 2, True), (0, 3, False),
    (1, 4, False), (1, 5, False),
    (2, 6, False), (2, 7, True),
    (3, 8, False), (3, 9, False),
]

LARG, ALT = 0.115, 0.088


def disegna_nodo(ax, x, y, testo, attivo):
    """Un riquadro arrotondato che rappresenta una pagina dell'indice."""
    bordo = BLU if attivo else GRIGIO
    fondo = BLU_CHIARO if attivo else GRIGIO_CHIARO
    ax.add_patch(
        FancyBboxPatch(
            (x - LARG / 2, y - ALT / 2), LARG, ALT,
            boxstyle="round,pad=0.012,rounding_size=0.02",
            linewidth=2.2 if attivo else 1.2,
            edgecolor=bordo, facecolor=fondo, zorder=3,
        )
    )
    ax.text(
        x, y, testo, ha="center", va="center", zorder=4,
        fontsize=11.5, fontweight="bold" if attivo else "normal",
        color=BLU if attivo else TESTO, family="DejaVu Sans",
    )


def disegna_arco(ax, partenza, arrivo, attivo):
    x1, y1 = partenza
    x2, y2 = arrivo
    ax.add_patch(
        FancyArrowPatch(
            (x1, y1 - ALT / 2 - 0.012), (x2, y2 + ALT / 2 + 0.012),
            arrowstyle="-|>", mutation_scale=13, shrinkA=0, shrinkB=0,
            linewidth=2.2 if attivo else 1.0,
            color=BLU if attivo else GRIGIO,
            zorder=2, alpha=1.0 if attivo else 0.55,
        )
    )


def main():
    fig, ax = plt.subplots(figsize=(11, 6.2))
    # il margine sinistro negativo lascia spazio alle etichette dei livelli
    ax.set_xlim(-0.10, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    for i, j, attivo in ARCHI:
        disegna_arco(ax, NODI[i][:2], NODI[j][:2], attivo)

    for x, y, etichetta, attivo in NODI:
        disegna_nodo(ax, x, y, etichetta, attivo)

    # etichette dei tre livelli, nel margine a sinistra dei nodi
    for y, nome in ((0.80, "radice"), (0.52, "nodi interni"), (0.20, "foglie")):
        ax.text(
            -0.09, y, nome, ha="left", va="center",
            fontsize=10, color=GRIGIO, style="italic", family="DejaVu Sans",
        )

    # la query in alto
    ax.text(
        0.52, 0.96, 'SELECT * FROM "Dipendenti" WHERE id = 42',
        ha="center", va="center", fontsize=13, color=TESTO,
        family="DejaVu Sans Mono",
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#f8fafc",
                  edgecolor=GRIGIO, linewidth=1),
    )

    # il risultato, sotto la foglia raggiunta
    ax.annotate(
        "riga trovata",
        xy=(0.595, 0.20 - ALT / 2), xytext=(0.595, 0.055),
        ha="center", va="center", fontsize=11,
        color=ARANCIO, fontweight="bold", family="DejaVu Sans",
        arrowprops=dict(arrowstyle="-|>", color=ARANCIO, linewidth=2),
    )

    # la morale
    ax.text(
        0.52, -0.02,
        "3 letture invece di 500 000: a ogni livello si scarta la maggior parte delle righe",
        ha="center", va="center", fontsize=11, color=TESTO, family="DejaVu Sans",
    )

    destinazione = Path(__file__).resolve().parent.parent / "img" / "BTREE.png"
    destinazione.parent.mkdir(exist_ok=True)
    fig.savefig(destinazione, dpi=150, bbox_inches="tight",
                facecolor="white", pad_inches=0.35)
    print(f"Creato: {destinazione}")


if __name__ == "__main__":
    main()
