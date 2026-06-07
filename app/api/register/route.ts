// app/api/register/route.ts — Registrazione nuovo utente PAZIENTE

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  codiceFiscale: z.string().length(16),
  dataNascita: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Data non valida" }),
  telefono: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, cognome, email, password, codiceFiscale, dataNascita, telefono } = parsed.data;

    // Controlla duplicati
    const esistente = await prisma.utente.findFirst({
      where: { OR: [{ email }, { codiceFiscale }] },
    });
    if (esistente) {
      return NextResponse.json(
        { error: "Email o codice fiscale già registrati." },
        { status: 409 }
      );
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
        ruolo: "PAZIENTE",
      },
      select: { id: true, email: true, nome: true, cognome: true },
    });

    return NextResponse.json({ utente }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Errore interno del server." }, { status: 500 });
  }
}
