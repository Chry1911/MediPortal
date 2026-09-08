"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Euro, CalendarDays, Users, Stethoscope, FileText, TrendingUp, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

interface DashData {
  incassiTotali: number;
  prenotazioniTotali: number;
  pagamentiCompletati: number;
  tassoIncasso: number;
  incassiPerMese: { mese: string; incasso: number }[];
  prestazioniTop: { nome: string; count: number; incasso: number }[];
  repartiStats: { reparto: string; count: number }[];
  prenotazioniOggi: number;
  totalePazienti: number;
  totaleMedici: number;
  refertiTotali: number;
  refertiInElaborazione: number;
  prenotazioniPerStato: Record<string, number>;
}

const STATO_COLORS: Record<string, string> = {
  IN_ATTESA: "#f59e0b",
  CONFERMATA: "#3b82f6",
  COMPLETATA: "#22c55e",
  ANNULLATA: "#ef4444",
};

const STATO_LABEL: Record<string, string> = {
  IN_ATTESA: "In attesa",
  CONFERMATA: "Confermata",
  COMPLETATA: "Completata",
  ANNULLATA: "Annullata",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }
  if (!data) return null;

  const pieData = Object.entries(data.prenotazioniPerStato).map(([stato, count]) => ({
    name: STATO_LABEL[stato] ?? stato,
    value: count,
    color: STATO_COLORS[stato] ?? "#94a3b8",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Amministrativa</h1>
        <p className="mt-1 text-sm text-gray-500">Stato generale dell'ospedale e andamento economico</p>
      </div>

      {/* KPI economici */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={<Euro className="h-5 w-5 text-green-600" />} bg="bg-green-50"
          label="Incassi totali" value={`€ ${data.incassiTotali.toFixed(2)}`} href="/admin/pagamenti" />
        <KpiCard icon={<TrendingUp className="h-5 w-5 text-indigo-600" />} bg="bg-indigo-50"
          label="Tasso di incasso" value={`${data.tassoIncasso.toFixed(1)}%`}
          sub={`${data.pagamentiCompletati} pagamenti completati`} href="/admin/pagamenti" />
        <KpiCard icon={<CalendarDays className="h-5 w-5 text-blue-600" />} bg="bg-blue-50"
          label="Prenotazioni oggi" value={data.prenotazioniOggi} href="/admin/prenotazioni" />
        <KpiCard icon={<Activity className="h-5 w-5 text-orange-600" />} bg="bg-orange-50"
          label="Prenotazioni totali" value={data.prenotazioniTotali} href="/admin/prenotazioni" />
      </div>

      {/* KPI operativi */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={<Users className="h-5 w-5 text-sky-600" />} bg="bg-sky-50"
          label="Pazienti registrati" value={data.totalePazienti} href="/admin/utenti?ruolo=PAZIENTE" />
        <KpiCard icon={<Stethoscope className="h-5 w-5 text-purple-600" />} bg="bg-purple-50"
          label="Medici in servizio" value={data.totaleMedici} href="/admin/utenti?ruolo=MEDICO" />
        <KpiCard icon={<FileText className="h-5 w-5 text-teal-600" />} bg="bg-teal-50"
          label="Referti totali" value={data.refertiTotali} />
        <KpiCard icon={<FileText className="h-5 w-5 text-amber-600" />} bg="bg-amber-50"
          label="Referti in elaborazione" value={data.refertiInElaborazione} />
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Incassi mensili (ultimi 6 mesi)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.incassiPerMese}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mese" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => [`€ ${v.toFixed(2)}`, "Incasso"]} />
              <Bar dataKey="incasso" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Prenotazioni per stato</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Prestazioni top */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Prestazioni più richieste</h2>
            <Link href="/admin/prestazioni" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Catalogo →
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {data.prestazioniTop.map((p) => (
              <li key={p.nome} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.count} prenotazioni</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">€ {p.incasso.toFixed(2)}</p>
              </li>
            ))}
            {data.prestazioniTop.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-gray-400">Nessun dato disponibile</li>
            )}
          </ul>
        </div>

        {/* Reparti */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Attività per reparto</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {data.repartiStats.map((r) => (
              <li key={r.reparto} className="flex items-center justify-between px-6 py-3">
                <p className="text-sm font-medium text-gray-900">{r.reparto}</p>
                <p className="text-sm text-gray-500">{r.count} prenotazioni</p>
              </li>
            ))}
            {data.repartiStats.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-gray-400">Nessun dato disponibile</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon, bg, label, value, sub, href,
}: {
  icon: React.ReactNode; bg: string; label: string;
  value: string | number; sub?: string; href?: string;
}) {
  const content = (
    <>
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </>
  );
  if (!href) {
    return <div className="rounded-xl border border-gray-200 bg-white p-5">{content}</div>;
  }
  return (
    <Link href={href} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      {content}
    </Link>
  );
}
