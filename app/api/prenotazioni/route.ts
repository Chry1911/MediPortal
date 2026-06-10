// app/api/prenotazioni/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const stato = searchParams.get("stato");

  const prenotazioni = await prisma.prenotazione.findMany({
    where: {
      pazienteId: userId,
      ...(stato ? { stato: stato as any } : {}),
    },
    include: {
      prestazione: { select: { nome: true, reparto: true, costo: true, durata: true } },
      medico: { select: { nome: true, cognome: true } },
      pagamento: { select: { id: true, stato: true, importo: true, dataScadenza: true, metodoPagamento: true } },
      referto: { select: { id: true, stato: true, titolo: true, fileUrl: true } },
    },
    orderBy: { dataOra: "desc" },
  });

  return NextResponse.json(
    prenotazioni.map((p) => ({
      id: p.id,
      codice: p.codice,
      dataOra: p.dataOra,
      stato: p.stato,
      note: p.note,
      prestazione: { nome: p.prestazione.nome, reparto: p.prestazione.reparto, costo: Number(p.prestazione.costo), durata: p.prestazione.durata },
      medico: `Dr. ${p.medico.nome} ${p.medico.cognome}`,
      pagamento: p.pagamento ? { ...p.pagamento, importo: Number(p.pagamento.importo) } : null,
      referto: p.referto ?? null,
    }))
  );
}

const prenotazioneSchema = z.object({
  prestazioneId: z.string().min(1),
  medicoId: z.string().min(1),
  dataOra: z.string().refine((d) => !isNaN(Date.parse(d))),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = prenotazioneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { prestazioneId, medicoId, dataOra, note } = parsed.data;

  const prestazione = await prisma.prestazione.findUnique({ where: { id: prestazioneId } });
  if (!prestazione || !prestazione.attiva) {
    return NextResponse.json({ error: "Prestazione non disponibile" }, { status: 400 });
  }

  const prenotazione = await prisma.prenotazione.create({
    data: {
      pazienteId: userId,
      prestazioneId,
      medicoId,
      dataOra: new Date(dataOra),
      note: note ?? null,
    },
  });

  // Crea il pagamento associato automaticamente
  const dataScadenza = new Date(dataOra);
  dataScadenza.setDate(dataScadenza.getDate() - 1); // scadenza il giorno prima

  await prisma.pagamento.create({
    data: {
      prenotazioneId: prenotazione.id,
      importo: prestazione.costo,
      stato: "DA_PAGARE",
      dataScadenza,
    },
  });

  return NextResponse.json({ id: prenotazione.id, codice: prenotazione.codice }, { status: 201 });
}
