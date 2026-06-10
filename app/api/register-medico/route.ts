// app/api/register-medico/route.ts — Registrazione medico (protetta da secret)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  codiceFiscale: z.string().length(16),
  dataNascita: z.string().refine((d) => !isNaN(Date.parse(d))),
  telefono: z.string().optional(),
  secret: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dati non validi", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, cognome, email, password, codiceFiscale, dataNascita, telefono, secret } = parsed.data;

    // Verifica secret di registrazione medico
    const medicoSecret = process.env.MEDICO_REGISTER_SECRET ?? "medicoSecret123";
    if (secret !== medicoSecret) {
      return NextResponse.json({ message: "Codice di registrazione non valido." }, { status: 403 });
    }

    const esistente = await prisma.utente.findFirst({
      where: { OR: [{ email }, { codiceFiscale }] },
    });
    if (esistente) {
      return NextResponse.json({ message: "Email o codice fiscale già registrati." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const utente = await prisma.utente.create({
      data: {
        nome,
        cognome,
        email,
        passwordHash,
        codiceFiscale: codiceFiscale.toUpperCase(),
        dataNascita: new Date(dataNascita),
        telefono: telefono ?? null,
        ruolo: "MEDICO",
      },
      select: { id: true, email: true, nome: true, cognome: true, ruolo: true },
    });

    return NextResponse.json({ utente }, { status: 201 });
  } catch (err) {
    console.error("[register-medico]", err);
    return NextResponse.json({ message: "Errore interno del server." }, { status: 500 });
  }
}
