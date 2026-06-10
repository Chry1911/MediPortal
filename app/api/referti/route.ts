// app/api/referti/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;

  const referti = await prisma.referto.findMany({
    where: { prenotazione: { pazienteId: userId } },
    include: {
      prenotazione: {
        include: {
          prestazione: { select: { nome: true, reparto: true } },
        },
      },
      medico: { select: { nome: true, cognome: true } },
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
      medico: `Dr. ${r.medico.nome} ${r.medico.cognome}`,
      prenotazioneId: r.prenotazioneId,
    }))
  );
}
