// app/api/dashboard/route.ts — Dati aggregati per il paziente loggato

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;

  const [prenotazioni, pagamenti, referti] = await Promise.all([
    prisma.prenotazione.findMany({
      where: { pazienteId: userId },
      include: {
        prestazione: { select: { nome: true, reparto: true, costo: true } },
        medico: { select: { nome: true, cognome: true } },
        pagamento: { select: { stato: true, importo: true } },
        referto: { select: { stato: true } },
      },
      orderBy: { dataOra: "desc" },
      take: 5,
    }),
    prisma.pagamento.findMany({
      where: { prenotazione: { pazienteId: userId } },
      select: { stato: true, importo: true },
    }),
    prisma.referto.findMany({
      where: { prenotazione: { pazienteId: userId } },
      select: { stato: true },
    }),
  ]);

  const totalePrenotazioni = await prisma.prenotazione.count({ where: { pazienteId: userId } });
  const totaleReferti = await prisma.referto.count({ where: { prenotazione: { pazienteId: userId } } });

  const importoPagato = pagamenti
    .filter((p) => p.stato === "PAGATO")
    .reduce((acc, p) => acc + Number(p.importo), 0);

  const importoDaPagare = pagamenti
    .filter((p) => p.stato === "DA_PAGARE" || p.stato === "SCADUTO")
    .reduce((acc, p) => acc + Number(p.importo), 0);

  const refertiDisponibili = referti.filter((r) => r.stato === "DISPONIBILE").length;

  return NextResponse.json({
    totalePrenotazioni,
    totaleReferti,
    refertiDisponibili,
    importoPagato,
    importoDaPagare,
    prenotazioniRecenti: prenotazioni.map((p) => ({
      id: p.id,
      codice: p.codice,
      dataOra: p.dataOra,
      stato: p.stato,
      prestazione: p.prestazione.nome,
      reparto: p.prestazione.reparto,
      medico: `Dr. ${p.medico.cognome}`,
      costo: Number(p.prestazione.costo),
      pagamento: p.pagamento?.stato ?? null,
      referto: p.referto?.stato ?? null,
    })),
  });
}
