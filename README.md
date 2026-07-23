# MINI_ERP

Gestionale minimale a scopo didattico. Anagrafica dipendenti con reparti:
elenco, ricerca, creazione, modifica, eliminazione singola e multipla.

Backend REST in JavaScript (Express + Prisma), frontend React in TypeScript,
PostgreSQL in un container Docker.

---

## Stack

| Livello | Tecnologie |
|---|---|
| Frontend | React 19 · TypeScript · Vite |
| Backend | Node · Express 5 · JavaScript (moduli ES) |
| Database | PostgreSQL 16 in Docker · Prisma 7 (adapter `@prisma/adapter-pg`) |
| Strumenti | VS Code · Postman · Prisma Studio · Draw.io |

Il backend è in **JavaScript**, il frontend in **TypeScript**.

---

## Avvio rapido

Prerequisiti: Node 20+, Docker Desktop avviato.

```bash
# 1. database
cd MINI_ERP
docker compose up -d

# 2. backend  → http://localhost:3000
cd backend
npm install
npx prisma migrate dev --name init
npm run dev

# 3. frontend → http://localhost:5173   (in un altro terminale)
cd frontend
npm install
npm run dev
```

Apri **http://localhost:5173**. Il proxy di Vite inoltra `/api` alla porta 3000,
quindi non servono impostazioni CORS.

---

## Come è fatto

![Architettura di MINI_ERP](img/ARCHITETTURA.png)

Ci sono **due programmi distinti**, che girano su porte diverse e potrebbero stare su
macchine diverse.

A sinistra il **browser**. `main.tsx` accende React, `App.tsx` è il contenitore,
`DipendentiPage.tsx` tiene i dati in memoria e disegna tabella e pulsanti. Quando servono
dati non li chiede al database — non può vederlo — ma chiama una funzione di
`api/dipendenti.api.ts`.

A destra il **server**. `server.js` si mette in ascolto sulla porta 3000, `app.js`
configura Express, `routes` decide quale funzione chiamare per ogni indirizzo, il
`controller` esegue il lavoro e Prisma traduce tutto in SQL per PostgreSQL.

In mezzo, in arancione, l'**unico punto di contatto**: una richiesta HTTP. È il motivo per
cui `DipendentiPage.tsx` non può importare il controller — sono due mondi separati, e
l'unico modo di parlarsi è mandarsi messaggi attraverso la rete.

Guardando le due colonne si nota che si somigliano: la pagina sta al controller come il
file `api/` sta a Prisma. I primi decidono cosa fare, i secondi parlano con l'esterno.

---

## Struttura

```
MINI_ERP/
│
├── docker-compose.yml          PostgreSQL 16, porta 5433
│
├── backend/                    JavaScript, moduli ES
│   ├── .env                    DATABASE_URL, PORT
│   ├── prisma.config.js        richiesto da Prisma 7 (sostituisce url nello schema)
│   │
│   ├── prisma/
│   │   ├── schema.prisma       model Dipendenti, Reparto · enum Ruolo, Tipo_reparto
│   │   └── migrations/
│   │
│   └── src/
│       ├── server.js           avvio: app.listen(PORT)
│       ├── app.js              express.json() + montaggio del router
│       ├── config/prisma.js    PrismaClient con adapter, istanza unica
│       ├── routes/
│       │   └── dipendenti.routes.js
│       ├── controllers/
│       │   └── dipendenti.controller.js
│       └── services/
│           └── dipendenti.service.js    validazioni, nessun req/res
│
├── frontend/                   TypeScript + React
│   ├── vite.config.ts          proxy /api → localhost:3000
│   └── src/
│       ├── main.tsx            monta React nel DOM
│       ├── App.tsx             componente radice
│       ├── index.css
│       ├── api/
│       │   └── dipendenti.api.ts        le sei chiamate fetch
│       ├── types/
│       │   └── dipendenti.types.ts
│       ├── pages/
│       │   └── DipendentiPage.tsx       orchestra stato e azioni
│       └── components/
│           ├── TabellaDipendenti.tsx    disegna la tabella
│           ├── FormDipendente.tsx       crea e modifica
│           ├── ConfermaElimina.tsx      dialogo di conferma
│           └── Dialogo.tsx              velo + riquadro, riusabile
│
└── uml/                        7 diagrammi Draw.io
```

**Il flusso.** Backend: `routes → controller → service → Prisma → PostgreSQL`.
Frontend: `pagina → api → HTTP → backend`.

Browser e server sono **due programmi separati**: la pagina React non può
importare il controller, l'unico ponte è la richiesta HTTP.

---

## Modello dati

```prisma
enum Ruolo {
  Admin
  Super_Admin
  Operatore
}

enum Tipo_reparto {
  Ufficio_Logistico
  Ufficio_Commerciale
  Ufficio_Amministrazione
  Ufficio_Informatico
}

model Dipendenti {
  id        Int      @id @default(autoincrement())
  nome      String?
  cognome   String?
  ruolo     Ruolo    @default(Operatore)
  repartoId Int?
  reparto   Reparto? @relation(fields: [repartoId], references: [id])
}

model Reparto {
  id         Int          @id @default(autoincrement())
  reparto    Tipo_reparto @unique
  dipendente Dipendenti[]
}
```

Relazione **uno-a-molti**: un dipendente appartiene a un solo reparto, un reparto
ha molti dipendenti. `@unique` su `reparto` permette di cercarlo per nome — è ciò
che rende possibile `connectOrCreate`.

---

## API

Base: `http://localhost:3000/api/dipendenti`

| Metodo | Percorso | Descrizione |
|---|---|---|
| GET | `/` | elenco, con filtri opzionali |
| GET | `/:id` | un dipendente |
| POST | `/` | crea |
| PUT | `/:id` | modifica |
| DELETE | `/:id` | elimina uno |
| DELETE | `/` | elimina molti — body `{ "ids": [2,3] }` |

C'è anche `GET /api/ping` → `{"ok":true}`, che risponde senza toccare il
database: utile per distinguere "server rotto" da "database rotto".

### Filtri

```
GET /api/dipendenti?nome=luc&cognome=ros&ruolo=Admin&reparto=Ufficio_Logistico
```

`nome` e `cognome` cercano per corrispondenza parziale, ignorando maiuscole:
`luc` trova `Luca`. I filtri si combinano. Senza parametri restituisce tutto.

### Corpo delle richieste

```jsonc
// POST — nome e cognome obbligatori, ruolo e reparto facoltativi
{ "nome": "Mario", "cognome": "Rossi", "ruolo": "Operatore", "reparto": "Ufficio_Logistico" }

// PUT — ogni campo facoltativo, ma almeno uno presente
{ "ruolo": "Admin" }
{ "reparto": null }        // scollega il dipendente dal reparto

// DELETE multiplo
{ "ids": [2, 3] }
```

Il reparto si indica con il **nome**, non con l'id: il backend lo cerca e, se non
esiste, lo crea (`connectOrCreate`).

### Risposte

Ogni dipendente include il reparto collegato:

```json
{
  "id": 4,
  "nome": "Andrea",
  "cognome": "Langiotti",
  "ruolo": "Super_Admin",
  "repartoId": 2,
  "reparto": { "id": 2, "reparto": "Ufficio_Informatico" }
}
```

### Codici di stato

| Codice | Quando |
|---|---|
| 200 | operazione riuscita |
| 201 | risorsa creata (POST) |
| 400 | input non valido — **colpa del client** |
| 404 | dipendente inesistente |
| 409 | vincolo di chiave esterna (Prisma `P2003`) |
| 500 | errore interno — **colpa del server** |

Il dettaglio degli errori 500 finisce nel log del server, non nella risposta.

---

## Prova con Postman

Due accortezze che fanno perdere tempo se dimenticate:

- il body va su **raw → JSON**, non Text: altrimenti manca l'header
  `Content-Type` e `req.body` arriva vuoto
- attenzione agli **a-capo incollati nell'URL**: compaiono come `%0A` e
  producono un 404 che sembra inspiegabile

```
GET     http://localhost:3000/api/dipendenti
POST    http://localhost:3000/api/dipendenti     { "nome": "Mario", "cognome": "Rossi" }
GET     http://localhost:3000/api/dipendenti/1
PUT     http://localhost:3000/api/dipendenti/1   { "ruolo": "Admin" }
DELETE  http://localhost:3000/api/dipendenti/1
DELETE  http://localhost:3000/api/dipendenti     { "ids": [2, 3] }
```

Casi limite da verificare: body vuoto, ruolo inventato, id non numerico,
id inesistente. Devono rispondere `400` o `404`, mai `500`.

---

## Cosa succede quando apri la pagina

![Sequenza della GET elenco](img/GET.png)

Segui le frecce dall'alto verso il basso: quelle piene vanno verso destra (la richiesta),
quelle tratteggiate tornano verso sinistra (la risposta).

Appena la pagina si apre, `useEffect` parte una volta sola e chiama `getDipendenti()`.
Quella funzione fa una `fetch` verso `/api/dipendenti`, che Vite gira dalla porta 5173
alla 3000. Sul server, Express riconosce l'indirizzo, chiama il controller, il controller
chiede a Prisma `findMany()` e Prisma esegue un `SELECT` su PostgreSQL.

I dati tornano indietro per la stessa strada: righe della tabella → array di oggetti
JavaScript → `res.json()` con status 200 → il browser. Lì `gestisciRisposta()` controlla
che sia andata bene e `setDipendenti()` aggiorna lo stato.

L'ultimo passo è quello che conta: **cambiare lo stato fa ridisegnare la pagina**. Non
tocchi mai la tabella a mano — modifichi i dati e React aggiorna lo schermo da solo.

### Due cose che non si intuiscono

**L'array vuoto in `useEffect(() => {...}, [])`** significa "esegui una volta sola,
all'apertura". Senza, si innesca un ciclo infinito: la fetch cambia lo stato, lo stato
provoca un ridisegno, il ridisegno rilancia la fetch.

**`fetch` non considera un errore i codici HTTP.** Un 404 o un 500 arrivano come risposte
normali, con `res.ok` a `false`. Senza controllarlo, un messaggio d'errore del server
finirebbe dentro la tabella come se fosse un dipendente: per questo esiste
`gestisciRisposta()` in `frontend/src/api/dipendenti.api.ts`.

---

## Comandi

### Docker

```bash
docker compose up -d        # avvia
docker compose stop         # ferma, dati intatti
docker compose down         # rimuove il container, dati nel volume
docker compose down -v      # ATTENZIONE: cancella anche i dati
docker compose logs db
docker ps                   # verifica che mini_erp_db sia Up
```

### Prisma

```bash
npx prisma migrate dev --name <nome>   # crea le tabelle + genera il client
npx prisma generate                    # solo il client
npx prisma studio                      # interfaccia grafica sul database
npx prisma migrate status
```

Non usare `prisma init`: sovrascrive schema e `.env`.

### npm

```bash
npm run dev     # backend: node --watch · frontend: vite
npm start       # backend in produzione
npm run build   # frontend
```

---

## Configurazione

`backend/.env`

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mini_erp?schema=public"
PORT=3000
```

La porta è **5433**, non 5432: il container la espone lì per non entrare in
conflitto con un eventuale PostgreSQL già installato sul sistema.

Con **Prisma 7** l'URL non sta più nello `schema.prisma` ma in
[`prisma.config.js`](backend/prisma.config.js), e il client va costruito con un
adapter — vedi [`src/config/prisma.js`](backend/src/config/prisma.js).

---

## Diagrammi

Le due figure qui sopra vengono da `01-architettura` e `02-sequenza-get`. Gli altri cinque
diagrammi coprono un endpoint ciascuno. I sorgenti sono in [`uml/`](uml/), formato Draw.io:
si aprono in VS Code con l'estensione *Draw.io Integration*, oppure su
[app.diagrams.net](https://app.diagrams.net).

| File | Contenuto |
|---|---|
| `01-architettura` | mappa a due colonne, browser e server |
| `02-sequenza-get` | GET elenco, dal `useEffect` alla tabella |
| `03-sequenza-get-uno` | GET singolo, perché serve `Number(id)` |
| `04-sequenza-post` | POST, il ruolo di `express.json()` |
| `05-sequenza-put` | PUT, `where` contro `data` |
| `06-sequenza-delete` | DELETE singolo |
| `07-sequenza-delete-multiplo` | DELETE multiplo, con il service |

Per esportarne altri in PNG: aprire il `.drawio` in VS Code → click destro →
*Export as PNG* → salvare in `img/`.

---

## Note tecniche

**Un solo `PrismaClient`.** Istanziato una volta in
[`config/prisma.js`](backend/src/config/prisma.js) e condiviso. Mai chiamare
`$disconnect()` in un controller: chiuderebbe la connessione per tutte le
richieste successive.

**Il 404 sta in due posti diversi.** `findUnique` e `findFirst` restituiscono
`null` → si controlla con un `if`. `update` e `delete` **lanciano** l'errore
`P2025` → si gestisce nel `catch`. `deleteMany` non lancia: restituisce
`{ count: 0 }`.

**`deleteMany` invece di un ciclo.** Un ciclo di `delete` farebbe N query, e se
una fallisce a metà i record già cancellati restano tali senza modo pulito di
riportare l'esito. `deleteMany` è una query sola.

**Il service non conosce HTTP.** Le funzioni in
[`dipendenti.service.js`](backend/src/services/dipendenti.service.js) ricevono
dati e restituiscono `{ ok, dati }` oppure `{ ok, errore }`. È il controller a
tradurre l'esito in una risposta. Per questo sono riusabili e testabili da sole.

**I componenti React non conoscono la rete.** Nessuno importa
`dipendenti.api.ts`: ricevono dati tramite props e comunicano con callback
(`onModifica`, `onElimina`). Stesso principio del punto sopra.

**Estensioni negli import.** Nel backend `.js` è obbligatoria (moduli ES); nel
frontend Vite la risolve da sola.

---

## Stato

Completato: CRUD con validazione, filtri, relazione dipendente-reparto,
interfaccia con tabella, form, conferme e selezione multipla.

Non implementato: autenticazione, paginazione, ordinamento per colonna, test
automatici, gestione autonoma dei reparti (esistono solo come conseguenza
dell'assegnazione a un dipendente).
