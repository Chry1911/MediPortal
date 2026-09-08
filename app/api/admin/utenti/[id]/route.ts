// app/api/admin/utenti/[id]/route.ts — Modifica ruolo/dati utente (solo ADMIN)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function requireAdmin(role: string | undefined) {
  return role === "ADMIN";
}

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  cognome: z.string().min(2).optional(),
  telefono: z.string().optional(),
  ruolo: z.enum(["PAZIENTE", "MEDICO", "ADMIN"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireAdmin((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const utente = await prisma.utente.findUnique({ where: { id } });
  if (!utente) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  // Impedisce all'admin di rimuovere il proprio ruolo ADMIN per errore
  if (utente.id === (session.user as any).id && parsed.data.ruolo && parsed.data.ruolo !== "ADMIN") {
    return NextResponse.json({ error: "Non puoi modificare il tuo stesso ruolo amministratore." }, { status: 400 });
  }

  const updated = await prisma.utente.update({
    where: { id },
    data: parsed.data,
    select: { id: true, nome: true, cognome: true, email: true, ruolo: true, telefono: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireAdmin((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const { id } = await params;
  if (id === (session.user as any).id)
    return NextResponse.json({ error: "Non puoi eliminare il tuo stesso account." }, { status: 400 });

  const utente = await prisma.utente.findUnique({
    where: { id },
    include: { _count: { select: { prenotazioni: true, prenotazioniMedico: true, refertiCaricati: true } } },
  });
  if (!utente) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (utente._count.prenotazioni > 0 || utente._count.prenotazioniMedico > 0 || utente._count.refertiCaricati > 0) {
    return NextResponse.json(
      { error: "Impossibile eliminare: l'utente ha prenotazioni o referti collegati." },
      { status: 409 }
    );
  }

  await prisma.utente.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
