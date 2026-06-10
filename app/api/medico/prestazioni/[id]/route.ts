// app/api/medico/prestazioni/[id]/route.ts — Modifica / attiva-disattiva singola prestazione

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function requireMedico(role: string | undefined) {
  return role === "MEDICO" || role === "ADMIN";
}

const updateSchema = z.object({
  nome: z.string().min(3).optional(),
  descrizione: z.string().optional(),
  reparto: z.string().min(2).optional(),
  durata: z.number().int().min(5).max(480).optional(),
  costo: z.number().min(0).optional(),
  attiva: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireMedico((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const prestazione = await prisma.prestazione.findUnique({ where: { id: params.id } });
  if (!prestazione) return NextResponse.json({ error: "Prestazione non trovata" }, { status: 404 });

  const updated = await prisma.prestazione.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ ...updated, costo: Number(updated.costo) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!requireMedico((session.user as any).role))
    return NextResponse.json({ error: "Accesso riservato ai medici" }, { status: 403 });

  // Soft delete: disattiva invece di eliminare (preserva storico)
  await prisma.prestazione.update({
    where: { id: params.id },
    data: { attiva: false },
  });

  return NextResponse.json({ ok: true });
}
