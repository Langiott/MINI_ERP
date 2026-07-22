-- CreateEnum
CREATE TYPE "Ruolo" AS ENUM ('Admin', 'Super_Admin', 'Operatore');

-- CreateEnum
CREATE TYPE "Tipo_reparto" AS ENUM ('Ufficio_Logistico', 'Ufficio_Commerciale', 'Ufficio_Amministrazione', 'Ufficio_Informatico');

-- CreateTable
CREATE TABLE "Dipendenti" (
    "id" SERIAL NOT NULL,
    "nome" TEXT,
    "cognome" TEXT,
    "ruolo" "Ruolo" NOT NULL DEFAULT 'Operatore',
    "repartoId" INTEGER,

    CONSTRAINT "Dipendenti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reparto" (
    "id" SERIAL NOT NULL,
    "reparto" "Tipo_reparto" NOT NULL,

    CONSTRAINT "Reparto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reparto_reparto_key" ON "Reparto"("reparto");

-- AddForeignKey
ALTER TABLE "Dipendenti" ADD CONSTRAINT "Dipendenti_repartoId_fkey" FOREIGN KEY ("repartoId") REFERENCES "Reparto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
