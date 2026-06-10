// app/api/prestazioni/route.ts — Catalogo prestazioni disponibili

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const prestazioni = await prisma.prestazione.findMany({
    where: { attiva: true },
    orderBy: [{ reparto: "asc" }, { nome: "asc" }],
    select: { id: true, codice: true, nome: true, descrizione: true, reparto: true, durata: true, costo: true },
  });

  return NextResponse.json(prestazioni.map((p) => ({ ...p, costo: Number(p.costo) })));
}
