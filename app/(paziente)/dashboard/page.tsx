"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CreditCard, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DashboardData {
  totalePrenotazioni: number;
  totaleReferti: number;
  refertiDisponibili: number;
  importoPagato: number;
  importoDaPagare: number;
  prenotazioniRecenti: {
    id: string;
    codice: string;
    dataOra: string;
    stato: string;
    prestazione: string;
    reparto: string;
    medico: string;
    costo: number;
    pagamento: string | null;
    referto: string | null;
  }[];
}

const statoColors: Record<string, string> = {
  IN_ATTESA:  "bg-yellow-100 text-yellow-800",
  CONFERMATA: "bg-blue-100 text-blue-800",
  COMPLETATA: "bg-green-100 text-green-800",
  ANNULLATA:  "bg-red-100 text-red-800",
};

const statoLabels: Record<string, string> = {
  IN_ATTESA:  "In attesa",
  CONFERMATA: "Confermata",
  COMPLETATA: "Completata",
  ANNULLATA:  "Annullata",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Riepilogo della tua situazione sanitaria</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<CalendarDays className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-50"
          label="Prenotazioni"
          value={data.totalePrenotazioni}
          href="/prenotazioni"
        />
        <KpiCard
          icon={<FileText className="h-5 w-5 text-green-600" />}
          bg="bg-green-50"
          label="Referti"
          value={`${data.refertiDisponibili} disponibili`}
          sub={`${data.totaleReferti} totali`}
          href="/referti"
        />
        <KpiCard
          icon={<CreditCard className="h-5 w-5 text-indigo-600" />}
          bg="bg-indigo-50"
          label="Pagato"
          value={`€ ${data.importoPagato.toFixed(2)}`}
          href="/pagamenti"
        />
        <KpiCard
          icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
          bg="bg-orange-50"
          label="Da pagare"
          value={`€ ${data.importoDaPagare.toFixed(2)}`}
          href="/pagamenti"
        />
      </div>

      {/* Prenotazioni recenti */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Prenotazioni recenti</h2>
          <Link href="/prenotazioni" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Vedi tutte →
          </Link>
        </div>

        {data.prenotazioniRecenti.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <CalendarDays className="h-10 w-10 mb-2" />
            <p className="text-sm">Nessuna prenotazione ancora</p>
            <Link href="/prenotazioni" className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Prenota ora
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {data.prenotazioniRecenti.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <CalendarDays className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.prestazione}</p>
                  <p className="text-xs text-gray-500">
                    {p.medico} · {format(new Date(p.dataOra), "d MMM yyyy, HH:mm", { locale: it })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoColors[p.stato]}`}>
                    {statoLabels[p.stato]}
                  </span>
                  {p.pagamento === "DA_PAGARE" && (
                    <Link href="/pagamenti" className="text-xs font-medium text-orange-600 hover:underline">
                      Paga
                    </Link>
                  )}
                  {p.referto === "DISPONIBILE" && (
                    <Link href="/referti" className="text-xs font-medium text-green-600 hover:underline">
                      Referto
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink href="/prenotazioni" icon={<CalendarDays className="h-5 w-5" />} label="Nuova prenotazione" color="text-blue-600 bg-blue-50 hover:bg-blue-100" />
        <QuickLink href="/pagamenti" icon={<CreditCard className="h-5 w-5" />} label="Gestisci pagamenti" color="text-indigo-600 bg-indigo-50 hover:bg-indigo-100" />
        <QuickLink href="/referti" icon={<FileText className="h-5 w-5" />} label="Scarica referti" color="text-green-600 bg-green-50 hover:bg-green-100" />
      </div>
    </div>
  );
}

function KpiCard({ icon, bg, label, value, sub, href }: { icon: React.ReactNode; bg: string; label: string; value: string | number; sub?: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </Link>
  );
}

function QuickLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-xl border border-transparent p-4 font-medium text-sm transition-colors ${color}`}>
      {icon}
      {label}
    </Link>
  );
}
