// app/api/admin/pagamenti/route.ts — Elenco di tutti i pagamenti dell'ospedale (solo ADMIN)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const stato = searchParams.get("stato");

  const pagamenti = await prisma.pagamento.findMany({
    where: stato ? { stato: stato as any } : {},
    include: {
      prenotazione: {
        include: {
          paziente: { select: { nome: true, cognome: true } },
          prestazione: { select: { nome: true, reparto: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    pagamenti.map((p) => ({
      id: p.id,
      importo: Number(p.importo),
      stato: p.stato,
      metodoPagamento: p.metodoPagamento,
      dataScadenza: p.dataScadenza,
      dataPagamento: p.dataPagamento,
      paziente: `${p.prenotazione.paziente.nome} ${p.prenotazione.paziente.cognome}`,
      prestazione: p.prenotazione.prestazione.nome,
      reparto: p.prenotazione.prestazione.reparto,
    }))
  );
}
