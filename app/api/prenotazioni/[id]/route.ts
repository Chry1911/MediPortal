// app/api/prenotazioni/[id]/route.ts — Dettaglio e annullamento

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = params;

  const prenotazione = await prisma.prenotazione.findFirst({
    where: { id, pazienteId: userId },
  });

  if (!prenotazione) {
    return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
  }

  if (prenotazione.stato === "COMPLETATA") {
    return NextResponse.json({ error: "Non puoi annullare una prenotazione completata" }, { status: 400 });
  }

  await prisma.prenotazione.update({
    where: { id },
    data: { stato: "ANNULLATA" },
  });

  return NextResponse.json({ ok: true });
}
