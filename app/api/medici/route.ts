// app/api/medici/route.ts — Lista medici disponibili

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const medici = await prisma.utente.findMany({
    where: { ruolo: "MEDICO" },
    select: { id: true, nome: true, cognome: true },
    orderBy: { cognome: "asc" },
  });

  return NextResponse.json(medici.map((m) => ({ id: m.id, nome: `Dr. ${m.nome} ${m.cognome}` })));
}
