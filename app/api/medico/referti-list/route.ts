// app/api/medico/referti-list/route.ts — Lista referti caricati dal medico loggato

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;

  const referti = await prisma.referto.findMany({
    where: { medicoId },
    include: {
      prenotazione: {
        include: {
          prestazione: { select: { nome: true, reparto: true } },
          paziente:    { select: { nome: true, cognome: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    referti.map((r) => ({
      id: r.id,
      titolo: r.titolo,
      descrizione: r.descrizione,
      stato: r.stato,
      fileUrl: r.fileUrl,
      dataUpload: r.dataUpload,
      prestazione: r.prenotazione.prestazione.nome,
      reparto: r.prenotazione.prestazione.reparto,
      paziente: `${r.prenotazione.paziente.nome} ${r.prenotazione.paziente.cognome}`,
      prenotazioneId: r.prenotazioneId,
    }))
  );
}
