// app/api/medico/prenotazioni/[id]/route.ts — Aggiorna stato prenotazione

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  stato: z.enum(["CONFERMATA", "COMPLETATA", "ANNULLATA"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;

  const prenotazione = await prisma.prenotazione.findFirst({
    where: { id: params.id, medicoId },
  });
  if (!prenotazione) return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Stato non valido" }, { status: 400 });

  const updated = await prisma.prenotazione.update({
    where: { id: params.id },
    data: { stato: parsed.data.stato },
  });

  return NextResponse.json({ id: updated.id, stato: updated.stato });
}
