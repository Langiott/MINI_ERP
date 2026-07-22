// Valori ammessi dagli enum dello schema Prisma.
export const RUOLI = ['Admin', 'Super_Admin', 'Operatore'];

export const REPARTI = [
    'Ufficio_Logistico',
    'Ufficio_Commerciale',
    'Ufficio_Amministrazione',
    'Ufficio_Informatico',
];

// Tutte queste funzioni non conoscono req/res: ricevono dati,
// restituiscono dati. Cosi' sono riusabili e testabili da sole.

// Un id valido e' un intero positivo. Number('abc') da' NaN,
// Number('') da' 0: entrambi vanno scartati prima di Prisma.
export const validaId = (valore) => {
    const id = Number(valore);

    if (!Number.isInteger(id) || id <= 0) {
        return { ok: false, errore: `Id non valido: "${valore}"` };
    }

    return { ok: true, id };
};

export const validaIds = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        return { ok: false, errore: 'Serve un array "ids" non vuoto' };
    }

    const idsNumerici = [];

    for (const valore of ids) {
        const esito = validaId(valore);
        if (esito.ok) {
            idsNumerici.push(esito.id);
        }
    }

    if (idsNumerici.length === 0) {
        return { ok: false, errore: 'Nessun id valido' };
    }

    return { ok: true, ids: idsNumerici };
};

// Usata dalla POST: nome e cognome sono obbligatori,
// il ruolo e' facoltativo (lo schema ha @default(Operatore)).
export const validaNuovoDipendente = (body) => {
    const { nome, cognome, ruolo, reparto } = body ?? {};

    if (typeof nome !== 'string' || nome.trim() === '') {
        return { ok: false, errore: 'Il campo "nome" e\' obbligatorio' };
    }

    if (typeof cognome !== 'string' || cognome.trim() === '') {
        return { ok: false, errore: 'Il campo "cognome" e\' obbligatorio' };
    }

    if (ruolo !== undefined && !RUOLI.includes(ruolo)) {
        return { ok: false, errore: `Ruolo non valido. Ammessi: ${RUOLI.join(', ')}` };
    }

    if (reparto !== undefined && !REPARTI.includes(reparto)) {
        return { ok: false, errore: `Reparto non valido. Ammessi: ${REPARTI.join(', ')}` };
    }

    return {
        ok: true,
        dati: { nome: nome.trim(), cognome: cognome.trim(), ruolo, reparto },
    };
};

// Usata dalla PUT: qui ogni campo e' facoltativo, ma almeno
// uno deve esserci, altrimenti non c'e' niente da aggiornare.
export const validaModifica = (body) => {
    const { nome, cognome, ruolo, reparto } = body ?? {};

    if ([nome, cognome, ruolo, reparto].every((v) => v === undefined)) {
        return { ok: false, errore: 'Nessun campo da aggiornare' };
    }

    if (nome !== undefined && (typeof nome !== 'string' || nome.trim() === '')) {
        return { ok: false, errore: 'Il campo "nome" non puo\' essere vuoto' };
    }

    if (cognome !== undefined && (typeof cognome !== 'string' || cognome.trim() === '')) {
        return { ok: false, errore: 'Il campo "cognome" non puo\' essere vuoto' };
    }

    if (ruolo !== undefined && !RUOLI.includes(ruolo)) {
        return { ok: false, errore: `Ruolo non valido. Ammessi: ${RUOLI.join(', ')}` };
    }

    // null e' ammesso: significa "togli il reparto a questo dipendente".
    if (reparto !== undefined && reparto !== null && !REPARTI.includes(reparto)) {
        return { ok: false, errore: `Reparto non valido. Ammessi: ${REPARTI.join(', ')}` };
    }

    return {
        ok: true,
        dati: {
            nome: nome?.trim(),
            cognome: cognome?.trim(),
            ruolo,
            reparto,
        },
    };
};

// Traduce il NOME del reparto nella forma che Prisma si aspetta.
//   undefined → non toccare il campo
//   null      → scollega il dipendente dal reparto
//   "Ufficio_X" → collega, creando il reparto se non esiste
export const costruisciReparto = (reparto) => {
    if (reparto === undefined) return undefined;
    if (reparto === null) return { disconnect: true };

    return {
        connectOrCreate: {
            where: { reparto },
            create: { reparto },
        },
    };
};
