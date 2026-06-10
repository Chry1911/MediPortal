// app/api/medico/prenotazioni/route.ts — Prenotazioni assegnate al medico loggato

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const stato = searchParams.get("stato");
  const data = searchParams.get("data"); // YYYY-MM-DD

  const where: any = { medicoId };
  if (stato) where.stato = stato;
  if (data) {
    const start = new Date(data);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data);
    end.setHours(23, 59, 59, 999);
    where.dataOra = { gte: start, lte: end };
  }

  const prenotazioni = await prisma.prenotazione.findMany({
    where,
    include: {
      paziente: { select: { id: true, nome: true, cognome: true, codiceFiscale: true, dataNascita: true, telefono: true } },
      prestazione: { select: { nome: true, reparto: true, durata: true, costo: true } },
      pagamento: { select: { stato: true } },
      referto: { select: { id: true, stato: true, titolo: true } },
    },
    orderBy: { dataOra: "asc" },
  });

  return NextResponse.json(
    prenotazioni.map((p) => ({
      id: p.id,
      codice: p.codice,
      dataOra: p.dataOra,
      stato: p.stato,
      note: p.note,
      paziente: {
        id: p.paziente.id,
        nomeCompleto: `${p.paziente.nome} ${p.paziente.cognome}`,
        codiceFiscale: p.paziente.codiceFiscale,
        dataNascita: p.paziente.dataNascita,
        telefono: p.paziente.telefono,
      },
      prestazione: { ...p.prestazione, costo: Number(p.prestazione.costo) },
      pagamento: p.pagamento?.stato ?? null,
      referto: p.referto ?? null,
    }))
  );
}
