// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Riservato agli amministratori" }, { status: 403 });
  }
  // TODO: implementare query aggregazioni
  return NextResponse.json({
    incassiTotali: 0,
    prenotazioniTotali: 0,
    tassoIncasso: 0,
    incassiPerMese: [],
    prestazioniTop: [],
    repartiStats: [],
  });
}
