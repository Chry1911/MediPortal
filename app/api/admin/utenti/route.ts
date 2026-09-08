// app/api/admin/utenti/route.ts — Elenco e creazione utenti (solo ADMIN)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

function requireAdmin(role: string | undefined) {
  return role === "ADMIN";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireAdmin((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const ruolo = searchParams.get("ruolo");

  const utenti = await prisma.utente.findMany({
    where: ruolo ? { ruolo: ruolo as any } : {},
    select: {
      id: true, nome: true, cognome: true, email: true, codiceFiscale: true,
      dataNascita: true, telefono: true, ruolo: true, createdAt: true,
      _count: { select: { prenotazioni: true, prenotazioniMedico: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(utenti);
}

const utenteSchema = z.object({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  codiceFiscale: z.string().length(16),
  dataNascita: z.string().refine((d) => !isNaN(Date.parse(d))),
  telefono: z.string().optional(),
  ruolo: z.enum(["PAZIENTE", "MEDICO", "ADMIN"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireAdmin((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const body = await req.json();
  const parsed = utenteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { nome, cognome, email, password, codiceFiscale, dataNascita, telefono, ruolo } = parsed.data;

  const esistente = await prisma.utente.findFirst({
    where: { OR: [{ email }, { codiceFiscale: codiceFiscale.toUpperCase() }] },
  });
  if (esistente) return NextResponse.json({ error: "Email o codice fiscale già registrati." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const utente = await prisma.utente.create({
    data: {
      nome, cognome, email, passwordHash,
      codiceFiscale: codiceFiscale.toUpperCase(),
      dataNascita: new Date(dataNascita),
      telefono: telefono ?? null,
      ruolo,
    },
    select: { id: true, nome: true, cognome: true, email: true, ruolo: true },
  });

  return NextResponse.json(utente, { status: 201 });
}
