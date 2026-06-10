// app/api/medico/referti/route.ts — Caricamento referto da parte del medico

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const refertoSchema = z.object({
  prenotazioneId: z.string().min(1),
  titolo: z.string().min(3),
  descrizione: z.string().optional(),
  fileUrl: z.string().min(1),  // URL/path del file caricato
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "MEDICO")
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const medicoId = (session.user as any).id;

  const body = await req.json();
  const parsed = refertoSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { prenotazioneId, titolo, descrizione, fileUrl } = parsed.data;

  // Verifica che la prenotazione appartenga a questo medico
  const prenotazione = await prisma.prenotazione.findFirst({
    where: { id: prenotazioneId, medicoId },
    include: { referto: true },
  });
  if (!prenotazione)
    return NextResponse.json({ error: "Prenotazione non trovata o non di tua competenza" }, { status: 404 });

  if (prenotazione.referto)
    return NextResponse.json({ error: "Referto già presente per questa prenotazione" }, { status: 409 });

  // Crea il referto e segna la prenotazione come COMPLETATA
  const [referto] = await prisma.$transaction([
    prisma.referto.create({
      data: {
        prenotazioneId,
        medicoId,
        titolo,
        descrizione: descrizione ?? null,
        fileUrl,
        stato: "DISPONIBILE",
        dataUpload: new Date(),
      },
    }),
    prisma.prenotazione.update({
      where: { id: prenotazioneId },
      data: { stato: "COMPLETATA" },
    }),
  ]);

  return NextResponse.json(referto, { status: 201 });
}
