// app/api/admin/dashboard/route.ts — Statistiche ospedaliere aggregate (solo ADMIN)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Accesso riservato agli amministratori" }, { status: 403 });

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const domani = new Date(oggi);
  domani.setDate(domani.getDate() + 1);
  const seiMesiFa = new Date();
  seiMesiFa.setMonth(seiMesiFa.getMonth() - 5);
  seiMesiFa.setDate(1);
  seiMesiFa.setHours(0, 0, 0, 0);

  const [
    prenotazioniTotali,
    prenotazioniOggi,
    totalePazienti,
    totaleMedici,
    refertiTotali,
    refertiInElaborazione,
    pagamenti,
    prenotazioniPerStatoRaw,
    prenotazioniConDettagli,
  ] = await Promise.all([
    prisma.prenotazione.count(),
    prisma.prenotazione.count({ where: { dataOra: { gte: oggi, lt: domani } } }),
    prisma.utente.count({ where: { ruolo: "PAZIENTE" } }),
    prisma.utente.count({ where: { ruolo: "MEDICO" } }),
    prisma.referto.count(),
    prisma.referto.count({ where: { stato: "IN_ELABORAZIONE" } }),
    prisma.pagamento.findMany({
      select: { importo: true, stato: true, dataPagamento: true },
    }),
    prisma.prenotazione.groupBy({ by: ["stato"], _count: { _all: true } }),
    prisma.prenotazione.findMany({
      select: {
        prestazione: { select: { nome: true, reparto: true, costo: true } },
      },
    }),
  ]);

  const incassiTotali = pagamenti
    .filter((p) => p.stato === "PAGATO")
    .reduce((acc, p) => acc + Number(p.importo), 0);

  const pagamentiCompletati = pagamenti.filter((p) => p.stato === "PAGATO").length;
  const tassoIncasso = pagamenti.length > 0 ? (pagamentiCompletati / pagamenti.length) * 100 : 0;

  // Incassi per mese (ultimi 6 mesi)
  const mesiLabels: string[] = [];
  const incassiMap = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(seiMesiFa);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    mesiLabels.push(key);
    incassiMap.set(key, 0);
  }
  for (const p of pagamenti) {
    if (p.stato !== "PAGATO" || !p.dataPagamento) continue;
    const d = new Date(p.dataPagamento);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (incassiMap.has(key)) incassiMap.set(key, (incassiMap.get(key) ?? 0) + Number(p.importo));
  }
  const meseNomi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const incassiPerMese = mesiLabels.map((key) => {
    const mese = parseInt(key.split("-")[1], 10) - 1;
    return { mese: meseNomi[mese], incasso: incassiMap.get(key) ?? 0 };
  });

  // Prestazioni top (per numero prenotazioni + incasso potenziale)
  const prestazioniMap = new Map<string, { count: number; incasso: number }>();
  const repartiMap = new Map<string, number>();
  for (const p of prenotazioniConDettagli) {
    const nome = p.prestazione.nome;
    const entry = prestazioniMap.get(nome) ?? { count: 0, incasso: 0 };
    entry.count += 1;
    entry.incasso += Number(p.prestazione.costo);
    prestazioniMap.set(nome, entry);

    const reparto = p.prestazione.reparto;
    repartiMap.set(reparto, (repartiMap.get(reparto) ?? 0) + 1);
  }
  const prestazioniTop = [...prestazioniMap.entries()]
    .map(([nome, v]) => ({ nome, count: v.count, incasso: v.incasso }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const repartiStats = [...repartiMap.entries()]
    .map(([reparto, count]) => ({ reparto, count }))
    .sort((a, b) => b.count - a.count);

  const prenotazioniPerStato: Record<string, number> = {
    IN_ATTESA: 0, CONFERMATA: 0, ANNULLATA: 0, COMPLETATA: 0,
  };
  for (const r of prenotazioniPerStatoRaw) {
    prenotazioniPerStato[r.stato] = r._count._all;
  }

  return NextResponse.json({
    incassiTotali,
    prenotazioniTotali,
    pagamentiCompletati,
    tassoIncasso,
    incassiPerMese,
    prestazioniTop,
    repartiStats,
    prenotazioniOggi,
    totalePazienti,
    totaleMedici,
    refertiTotali,
    refertiInElaborazione,
    prenotazioniPerStato,
  });
}
