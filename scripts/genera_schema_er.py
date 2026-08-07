"""
Genera img/SCHEMA_ER.png: lo schema ER delle due tabelle del progetto.

Dipendenti e Reparto, i loro attributi, la relazione uno-a-molti e i due enum.
Il sorgente modificabile a mano è uml/09-schema-er.drawio.

Uso:  python scripts/genera_schema_er.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # nessuna finestra: salva e basta
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

# ── colori ────────────────────────────────────────────────────────────────
VERDE = "#82b366"          # entità Dipendenti
VERDE_FONDO = "#d5e8d4"
ROSSO = "#b85450"          # entità Reparto
ROSSO_FONDO = "#f8cecc"
ARANCIO = "#d79b00"        # la relazione
GIALLO_FONDO = "#fff2cc"   # riga della chiave esterna
VIOLA_FONDO = "#e1d5e7"    # riga del vincolo unique
GRIGIO = "#666666"
TESTO = "#0f172a"

MONO = "DejaVu Sans Mono"
SANS = "DejaVu Sans"

RIGA = 0.052               # altezza di una riga di attributo
TITOLO = 0.062             # altezza dell'intestazione


def entita(ax, x, y, larg, nome, bordo, fondo, righe):
    """Un riquadro-entità: intestazione colorata + una riga per attributo."""
    alt = TITOLO + RIGA * len(righe)
    ax.add_patch(
        FancyBboxPatch(
            (x, y - alt), larg, alt,
            boxstyle="round,pad=0.004,rounding_size=0.008",
            linewidth=2, edgecolor=bordo, facecolor="white", zorder=2,
        )
    )
    # intestazione
    ax.add_patch(
        Rectangle((x, y - TITOLO), larg, TITOLO,
                  linewidth=0, facecolor=fondo, zorder=3)
    )
    ax.text(x + larg / 2, y - TITOLO / 2, nome, ha="center", va="center",
            zorder=4, fontsize=13, fontweight="bold", color=TESTO, family=SANS)

    for i, (chiave, testo, sfondo, corsivo) in enumerate(righe):
        ry = y - TITOLO - RIGA * (i + 1)
        if sfondo:
            ax.add_patch(
                Rectangle((x + 0.003, ry), larg - 0.006, RIGA,
                          linewidth=0, facecolor=sfondo, zorder=3)
            )
        ax.text(x + 0.014, ry + RIGA / 2, chiave, ha="left", va="center",
                zorder=4, fontsize=9.5, fontweight="bold",
                color=ARANCIO if chiave == "FK" else TESTO, family=SANS)
        ax.text(x + 0.055, ry + RIGA / 2, testo, ha="left", va="center",
                zorder=4, fontsize=10.5, color=GRIGIO if corsivo else TESTO,
                style="italic" if corsivo else "normal", family=MONO)
        # linea di separazione fra gli attributi
        if i < len(righe) - 1:
            ax.plot([x + 0.006, x + larg - 0.006], [ry, ry],
                    color="#e2e8f0", linewidth=0.8, zorder=4)
    return alt


def enum(ax, x, y, larg, titolo, valori, bordo):
    """Un enum: elenco chiuso di valori ammessi, riquadro tratteggiato."""
    alt = 0.048 + 0.040 * len(valori)
    ax.add_patch(
        FancyBboxPatch(
            (x, y - alt), larg, alt,
            boxstyle="round,pad=0.004,rounding_size=0.008",
            linewidth=1.4, edgecolor=bordo, facecolor="white",
            linestyle="--", zorder=2,
        )
    )
    ax.text(x + 0.014, y - 0.028, titolo, ha="left", va="center", zorder=3,
            fontsize=10.5, fontweight="bold", color=bordo, family=MONO)
    for i, v in enumerate(valori):
        ax.text(x + 0.026, y - 0.062 - 0.040 * i, v, ha="left", va="center",
                zorder=3, fontsize=10, color=TESTO, family=MONO)
    return alt


def main():
    fig, ax = plt.subplots(figsize=(12.5, 6.6))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("white")

    x_dip, x_rep, larg = 0.045, 0.585, 0.370
    y_top = 0.945

    alt_dip = entita(
        ax, x_dip, y_top, larg, "Dipendenti", VERDE, VERDE_FONDO,
        [
            ("PK", "id : Int", None, False),
            ("", "nome : String?", None, False),
            ("", "cognome : String?", None, False),
            ("", "ruolo : Ruolo", None, False),
            ("FK", "repartoId : Int?", GIALLO_FONDO, False),
            ("", "reparto : Reparto?", None, True),
        ],
    )
    # Reparto è abbassato di 4 righe: così la sua riga "id" finisce alla stessa
    # altezza di "repartoId" e la relazione resta una linea orizzontale dritta.
    y_top_rep = y_top - RIGA * 4
    alt_rep = entita(
        ax, x_rep, y_top_rep, larg, "Reparto", ROSSO, ROSSO_FONDO,
        [
            ("PK", "id : Int", None, False),
            ("UQ", "reparto : Tipo_reparto", VIOLA_FONDO, False),
            ("", "dipendente : Dipendenti[]", None, True),
        ],
    )

    # la relazione: da repartoId (FK) a id (PK), orizzontale
    y_rel = y_top - TITOLO - RIGA * 4.5
    ax.plot([x_dip + larg, x_rep], [y_rel, y_rel],
            color=ARANCIO, linewidth=2.6, zorder=1, solid_capstyle="round")

    # cardinalità alle due estremità: N sul lato Dipendenti, 1 sul lato Reparto
    ax.text(x_dip + larg + 0.030, y_rel + 0.030, "N", ha="center", va="center",
            fontsize=15, fontweight="bold", color=ARANCIO, family=SANS)
    ax.text(x_rep - 0.030, y_rel + 0.030, "1", ha="center", va="center",
            fontsize=15, fontweight="bold", color=ARANCIO, family=SANS)

    # gli enum, sotto le rispettive entità
    y_enum = 0.435
    enum(ax, x_dip, y_enum, larg, "enum Ruolo",
         ["Admin", "Super_Admin", "Operatore"], VERDE)
    enum(ax, x_rep, y_enum, larg, "enum Tipo_reparto",
         ["Ufficio_Logistico", "Ufficio_Commerciale",
          "Ufficio_Amministrazione", "Ufficio_Informatico"], ROSSO)

    # collegamenti tratteggiati fra enum e campo che lo usa
    ax.plot([x_dip + 0.20, x_dip + 0.20], [y_enum, y_top - TITOLO - RIGA * 3.5],
            color=VERDE, linewidth=1.2, linestyle=":", zorder=1)
    ax.plot([x_rep + 0.20, x_rep + 0.20],
            [y_enum, y_top_rep - TITOLO - RIGA * 1.5],
            color=ROSSO, linewidth=1.2, linestyle=":", zorder=1)

    ax.text(
        0.5, 0.115,
        "PK = chiave primaria     FK = chiave esterna     "
        "UQ = valore unico     ? = campo facoltativo",
        ha="center", va="center", fontsize=10, color=GRIGIO, family=SANS,
    )

    destinazione = Path(__file__).resolve().parent.parent / "img" / "SCHEMA_ER.png"
    destinazione.parent.mkdir(exist_ok=True)
    fig.savefig(destinazione, dpi=150, bbox_inches="tight",
                facecolor="white", pad_inches=0.3)
    print(f"Creato: {destinazione}")


if __name__ == "__main__":
    main()
