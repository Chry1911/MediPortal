// app/api/medico/dashboard/route.ts — Stats del medico loggato

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);

  const [oggiList, totale, daRefertare, refertiCaricati] = await Promise.all([
    // Prenotazioni di oggi
    prisma.prenotazione.findMany({
      where: { medicoId, dataOra: { gte: oggi, lt: domani } },
      include: {
        paziente: { select: { nome: true, cognome: true } },
        prestazione: { select: { nome: true, durata: true } },
        referto: { select: { stato: true } },
      },
      orderBy: { dataOra: "asc" },
    }),
    // Totale prenotazioni
    prisma.prenotazione.count({ where: { medicoId } }),
    // Prenotazioni COMPLETATA senza referto
    prisma.prenotazione.count({
      where: { medicoId, stato: "COMPLETATA", referto: null },
    }),
    // Referti caricati dal medico
    prisma.referto.count({ where: { medicoId } }),
  ]);

  const prenotazioniOggi = await prisma.prenotazione.count({
    where: { medicoId, dataOra: { gte: oggi, lt: domani } },
  });

  return NextResponse.json({
    prenotazioniOggi,
    totalePrenotazioni: totale,
    daRefertare,
    refertiCaricati,
    agendaOggi: oggiList.map((p) => ({
      id: p.id,
      dataOra: p.dataOra,
      stato: p.stato,
      paziente: `${p.paziente.nome} ${p.paziente.cognome}`,
      prestazione: p.prestazione.nome,
      durata: p.prestazione.durata,
      haReferto: !!p.referto,
    })),
  });
}
