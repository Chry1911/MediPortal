// app/api/medico/referti/[id]/route.ts — Modifica referto già caricato

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  titolo: z.string().min(3).optional(),
  descrizione: z.string().optional(),
  fileUrl: z.string().min(1).optional(),
  stato: z.enum(["DISPONIBILE", "ARCHIVIATO"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;

  const referto = await prisma.referto.findFirst({ where: { id: params.id, medicoId } });
  if (!referto) return NextResponse.json({ error: "Referto non trovato" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const updated = await prisma.referto.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}
