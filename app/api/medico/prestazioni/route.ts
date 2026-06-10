// app/api/medico/prestazioni/route.ts — CRUD prestazioni (solo MEDICO)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function requireMedico(role: string | undefined) {
  return role === "MEDICO" || role === "ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireMedico((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const prestazioni = await prisma.prestazione.findMany({
    orderBy: [{ reparto: "asc" }, { nome: "asc" }],
    select: {
      id: true, codice: true, nome: true, descrizione: true,
      reparto: true, durata: true, costo: true, attiva: true, createdAt: true,
      _count: { select: { prenotazioni: true } },
    },
  });

  return NextResponse.json(prestazioni.map((p) => ({ ...p, costo: Number(p.costo) })));
}

const prestazioneSchema = z.object({
  codice: z.string().min(3).max(20),
  nome: z.string().min(3),
  descrizione: z.string().optional(),
  reparto: z.string().min(2),
  durata: z.number().int().min(5).max(480),
  costo: z.number().min(0),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireMedico((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const body = await req.json();
  const parsed = prestazioneSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const esistente = await prisma.prestazione.findUnique({ where: { codice: parsed.data.codice } });
  if (esistente)
    return NextResponse.json({ error: "Codice prestazione già esistente." }, { status: 409 });

  const prestazione = await prisma.prestazione.create({ data: parsed.data });
  return NextResponse.json({ ...prestazione, costo: Number(prestazione.costo) }, { status: 201 });
}
