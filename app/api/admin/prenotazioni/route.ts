// app/api/admin/prenotazioni/route.ts — Elenco di tutte le prenotazioni dell'ospedale (solo ADMIN)

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
  const reparto = searchParams.get("reparto");
  const data = searchParams.get("data");

  const where: any = {};
  if (stato) where.stato = stato;
  if (reparto) where.prestazione = { reparto };
  if (data) {
    const giorno = new Date(data);
    giorno.setHours(0, 0, 0, 0);
    const domani = new Date(giorno);
    domani.setDate(domani.getDate() + 1);
    where.dataOra = { gte: giorno, lt: domani };
  }

  const prenotazioni = await prisma.prenotazione.findMany({
    where,
    include: {
      paziente: { select: { nome: true, cognome: true } },
      medico: { select: { nome: true, cognome: true } },
      prestazione: { select: { nome: true, reparto: true, costo: true } },
      pagamento: { select: { stato: true, importo: true } },
      referto: { select: { stato: true } },
    },
    orderBy: { dataOra: "desc" },
    take: 200,
  });

  return NextResponse.json(
    prenotazioni.map((p) => ({
      id: p.id,
      codice: p.codice,
      dataOra: p.dataOra,
      stato: p.stato,
      paziente: `${p.paziente.nome} ${p.paziente.cognome}`,
      medico: `Dr. ${p.medico.nome} ${p.medico.cognome}`,
      prestazione: p.prestazione.nome,
      reparto: p.prestazione.reparto,
      costo: Number(p.prestazione.costo),
      pagamento: p.pagamento?.stato ?? null,
      referto: p.referto?.stato ?? null,
    }))
  );
}
