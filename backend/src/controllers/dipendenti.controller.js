import { prisma } from '../config/prisma.js';
import {
    validaId,
    validaIds,
    validaNuovoDipendente,
    validaModifica,
    costruisciReparto,
} from '../services/dipendenti.service.js';


const CON_REPARTO = { include: { reparto: true } };


const gestisciErrore = (error, res) => {
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Dipendente non trovato' });
    }
    if (error.code === 'P2003') {
        return res.status(409).json({ error: 'Il dipendente e\' collegato ad altri dati' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Errore interno del server' });
};


// GET /api/dipendenti
export const getAllDipendenti = async (req, res) => {
    try {
        const { nome, cognome, ruolo, reparto } = req.query;

        const where = {};

        if (nome) where.nome = { contains: String(nome), mode: 'insensitive' };
        if (cognome) where.cognome = { contains: String(cognome), mode: 'insensitive' };
        if (ruolo) where.ruolo = String(ruolo);
        if (reparto) where.reparto = { reparto: String(reparto) };

        const dipendenti = await prisma.dipendenti.findMany({
            where,
            ...CON_REPARTO,
            orderBy: { id: 'asc' },
        });

        res.json(dipendenti);
    } catch (error) {
        gestisciErrore(error, res);
    }
};

// GET /api/dipendenti/:id
export const getDipendente = async (req, res) => {
    try {
        const esito = validaId(req.params.id);

        if (!esito.ok) {
            return res.status(400).json({ error: esito.errore });
        }

        const dipendente = await prisma.dipendenti.findUnique({
            where: { id: esito.id },
            ...CON_REPARTO,
        });

        if (!dipendente) {
            return res.status(404).json({ error: 'Dipendente non trovato' });
        }

        res.json(dipendente);
    } catch (error) {
        gestisciErrore(error, res);
    }
};

// POST /api/dipendenti
// body: { nome, cognome, ruolo?, reparto? }
export const postDipendente = async (req, res) => {
    try {
        const esito = validaNuovoDipendente(req.body);

        if (!esito.ok) {
            return res.status(400).json({ error: esito.errore });
        }

        const { nome, cognome, ruolo, reparto } = esito.dati;
        const dipendente = await prisma.dipendenti.create({
            data: {
                nome,
                cognome,
                ruolo,
                reparto: costruisciReparto(reparto),
            },
            ...CON_REPARTO,
        });

        res.status(201).json(dipendente);
    } catch (error) {
        gestisciErrore(error, res);
    }
};

// PUT /api/dipendenti/:id
// body: { nome?, cognome?, ruolo?, reparto? }  — almeno un campo
export const updateDipendente = async (req, res) => {
    try {
        const esitoId = validaId(req.params.id);
        if (!esitoId.ok) {
            return res.status(400).json({ error: esitoId.errore });
        }
        const esito = validaModifica(req.body);
        if (!esito.ok) {
            return res.status(400).json({ error: esito.errore });
        }

        const { nome, cognome, ruolo, reparto } = esito.dati;
        const dipendente = await prisma.dipendenti.update({
            where: { id: esitoId.id },
            // I campi undefined vengono ignorati da Prisma:
            // aggiorna solo quello che il client ha davvero mandato.
            data: {
                nome,
                cognome,
                ruolo,
                reparto: costruisciReparto(reparto),
            },
            ...CON_REPARTO,
        });

        res.json(dipendente);
    } catch (error) {
        gestisciErrore(error, res);
    }
};

// DELETE /api/dipendenti/:id
export const deleteDipendente = async (req, res) => {
    try {
        const esito = validaId(req.params.id);
        if (!esito.ok) {
            return res.status(400).json({ error: esito.errore });
        }
        const dipendente = await prisma.dipendenti.delete({
            where: { id: esito.id },
        });
        res.json(dipendente);
    } catch (error) {
        gestisciErrore(error, res);
    }
};

// DELETE /api/dipendenti
// body: { ids: [3, 7, 12] }
export const deleteDipendenti = async (req, res) => {
    try {
        const esito = validaIds(req.body?.ids);
        if (!esito.ok) {
            return res.status(400).json({ error: esito.errore });
        }
        const result = await prisma.dipendenti.deleteMany({
            where: { id: { in: esito.ids } },
        });
        if (result.count === 0) {
            return res.status(404).json({ error: 'Nessun dipendente trovato' });
        }
        res.json({ eliminati: result.count });
    } catch (error) {
        gestisciErrore(error, res);
    }
};
