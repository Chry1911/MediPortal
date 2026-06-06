// prisma/seed.ts
// Dati di esempio per sviluppo
// Esegui con: npm run db:seed

import { PrismaClient, Ruolo } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database MediPortal...");

  // ── Utenti ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.utente.upsert({
    where: { email: "admin@mediaportal.it" },
    update: {},
    create: {
      nome: "Mario",
      cognome: "Rossi",
      email: "admin@mediaportal.it",
      passwordHash,
      codiceFiscale: "RSSMRA80A01H501Z",
      dataNascita: new Date("1980-01-01"),
      ruolo: Ruolo.ADMIN,
    },
  });

  const medico = await prisma.utente.upsert({
    where: { email: "dott.verdi@mediaportal.it" },
    update: {},
    create: {
      nome: "Giuseppe",
      cognome: "Verdi",
      email: "dott.verdi@mediaportal.it",
      passwordHash,
      codiceFiscale: "VRDGPP75B15F205X",
      dataNascita: new Date("1975-02-15"),
      ruolo: Ruolo.MEDICO,
    },
  });

  const paziente = await prisma.utente.upsert({
    where: { email: "paziente@example.com" },
    update: {},
    create: {
      nome: "Anna",
      cognome: "Bianchi",
      email: "paziente@example.com",
      passwordHash,
      codiceFiscale: "BNCNNA90C41L219K",
      dataNascita: new Date("1990-03-41"),
      telefono: "+39 333 1234567",
      ruolo: Ruolo.PAZIENTE,
    },
  });

  // ── Prestazioni ──────────────────────────────────────
  const prestazioni = await Promise.all([
    prisma.prestazione.upsert({
      where: { codice: "VIS-CARD-001" },
      update: {},
      create: { codice: "VIS-CARD-001", nome: "Visita Cardiologica", reparto: "Cardiologia", durata: 30, costo: 50.00 },
    }),
    prisma.prestazione.upsert({
      where: { codice: "ECG-001" },
      update: {},
      create: { codice: "ECG-001", nome: "Elettrocardiogramma", reparto: "Cardiologia", durata: 20, costo: 30.00 },
    }),
    prisma.prestazione.upsert({
      where: { codice: "VIS-ORT-001" },
      update: {},
      create: { codice: "VIS-ORT-001", nome: "Visita Ortopedica", reparto: "Ortopedia", durata: 30, costo: 50.00 },
    }),
    prisma.prestazione.upsert({
      where: { codice: "RX-001" },
      update: {},
      create: { codice: "RX-001", nome: "Radiografia", reparto: "Radiologia", durata: 15, costo: 25.00 },
    }),
    prisma.prestazione.upsert({
      where: { codice: "ANAL-001" },
      update: {},
      create: { codice: "ANAL-001", nome: "Analisi del Sangue", reparto: "Laboratorio", durata: 10, costo: 20.00 },
    }),
  ]);

  console.log(`✅ Creati ${prestazioni.length} prestazioni`);
  console.log("✅ Utenti di test creati:");
  console.log("   📧 admin@mediaportal.it        (ADMIN)");
  console.log("   📧 dott.verdi@mediaportal.it   (MEDICO)");
  console.log("   📧 paziente@example.com        (PAZIENTE)");
  console.log("   🔑 Password: Password123!");
  console.log("\n🎉 Seed completato!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
