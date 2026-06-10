// app/api/pagamenti/[id]/paga/route.ts — Simula il pagamento

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pagaSchema = z.object({
  metodoPagamento: z.enum(["Carta di credito", "Carta di debito", "Bonifico", "Contanti"]),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = params;

  const pagamento = await prisma.pagamento.findFirst({
    where: { id, prenotazione: { pazienteId: userId } },
  });

  if (!pagamento) return NextResponse.json({ error: "Pagamento non trovato" }, { status: 404 });
  if (pagamento.stato === "PAGATO") return NextResponse.json({ error: "Già pagato" }, { status: 400 });

  const body = await req.json();
  const parsed = pagaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Metodo di pagamento non valido" }, { status: 400 });

  const aggiornato = await prisma.pagamento.update({
    where: { id },
    data: {
      stato: "PAGATO",
      metodoPagamento: parsed.data.metodoPagamento,
      dataPagamento: new Date(),
    },
  });

  // Aggiorna stato prenotazione a CONFERMATA se era IN_ATTESA
  await prisma.prenotazione.updateMany({
    where: { id: pagamento.prenotazioneId, stato: "IN_ATTESA" },
    data: { stato: "CONFERMATA" },
  });

  return NextResponse.json({ ok: true, stato: aggiornato.stato });
}
