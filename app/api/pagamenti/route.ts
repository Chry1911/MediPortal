// app/api/pagamenti/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;

  const pagamenti = await prisma.pagamento.findMany({
    where: { prenotazione: { pazienteId: userId } },
    include: {
      prenotazione: {
        include: {
          prestazione: { select: { nome: true, reparto: true } },
          medico: { select: { cognome: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    pagamenti.map((p) => ({
      id: p.id,
      importo: Number(p.importo),
      stato: p.stato,
      metodoPagamento: p.metodoPagamento,
      dataScadenza: p.dataScadenza,
      dataPagamento: p.dataPagamento,
      ricevutaUrl: p.ricevutaUrl,
      prenotazione: {
        id: p.prenotazione.id,
        codice: p.prenotazione.codice,
        dataOra: p.prenotazione.dataOra,
        prestazione: p.prenotazione.prestazione.nome,
        reparto: p.prenotazione.prestazione.reparto,
        medico: `Dr. ${p.prenotazione.medico.cognome}`,
      },
    }))
  );
}
