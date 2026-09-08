"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Prenotazione {
  id: string; codice: string; dataOra: string; stato: string;
  paziente: string; medico: string; prestazione: string; reparto: string;
  costo: number; pagamento: string | null; referto: string | null;
}

const STATI = ["", "IN_ATTESA", "CONFERMATA", "COMPLETATA", "ANNULLATA"];
const statoBadge: Record<string, string> = {
  IN_ATTESA: "bg-yellow-100 text-yellow-800", CONFERMATA: "bg-blue-100 text-blue-800",
  COMPLETATA: "bg-green-100 text-green-800", ANNULLATA: "bg-red-100 text-red-800",
};
const statoLabel: Record<string, string> = {
  IN_ATTESA: "In attesa", CONFERMATA: "Confermata", COMPLETATA: "Completata", ANNULLATA: "Annullata",
};

export default function AdminPrenotazioniPage() {
  const [lista, setLista] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroData, setFiltroData] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroStato) params.set("stato", filtroStato);
    if (filtroData) params.set("data", filtroData);
    fetch(`/api/admin/prenotazioni?${params}`)
      .then((r) => r.json())
      .then((d) => { setLista(d); setLoading(false); });
  }, [filtroStato, filtroData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prenotazioni ospedaliere</h1>
        <p className="mt-1 text-sm text-gray-500">Panoramica di tutte le prenotazioni dell'ospedale</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {STATI.map((s) => (
            <button key={s} onClick={() => setFiltroStato(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtroStato === s ? "bg-indigo-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
              }`}>
              {s === "" ? "Tutte" : statoLabel[s]}
            </button>
          ))}
        </div>
        <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        {filtroData && (
          <button onClick={() => setFiltroData("")} className="text-sm text-gray-400 hover:text-gray-600">
            × Rimuovi data
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <CalendarDays className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessuna prenotazione trovata</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Data</th>
                <th className="px-5 py-3 text-left">Paziente</th>
                <th className="px-5 py-3 text-left">Medico</th>
                <th className="px-5 py-3 text-left">Prestazione</th>
                <th className="px-5 py-3 text-left">Reparto</th>
                <th className="px-5 py-3 text-right">Costo</th>
                <th className="px-5 py-3 text-left">Stato</th>
                <th className="px-5 py-3 text-left">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 whitespace-nowrap text-gray-700">
                    {format(new Date(p.dataOra), "d MMM yyyy, HH:mm", { locale: it })}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{p.paziente}</td>
                  <td className="px-5 py-3 text-gray-600">{p.medico}</td>
                  <td className="px-5 py-3 text-gray-600">{p.prestazione}</td>
                  <td className="px-5 py-3 text-gray-500">{p.reparto}</td>
                  <td className="px-5 py-3 text-right text-gray-700">€ {p.costo.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[p.stato]}`}>
                      {statoLabel[p.stato]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.pagamento ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
