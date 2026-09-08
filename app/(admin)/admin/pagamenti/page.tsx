"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Pagamento {
  id: string; importo: number; stato: string; metodoPagamento: string | null;
  dataScadenza: string; dataPagamento: string | null;
  paziente: string; prestazione: string; reparto: string;
}

const statoBadge: Record<string, string> = {
  DA_PAGARE: "bg-orange-100 text-orange-800", PAGATO: "bg-green-100 text-green-800",
  RIMBORSATO: "bg-blue-100 text-blue-800", SCADUTO: "bg-red-100 text-red-800",
};
const statoLabel: Record<string, string> = {
  DA_PAGARE: "Da pagare", PAGATO: "Pagato", RIMBORSATO: "Rimborsato", SCADUTO: "Scaduto",
};

export default function AdminPagamentiPage() {
  const [lista, setLista] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtro) params.set("stato", filtro);
    fetch(`/api/admin/pagamenti?${params}`)
      .then((r) => r.json())
      .then((d) => { setLista(d); setLoading(false); });
  }, [filtro]);

  const totIncassato = lista.filter((p) => p.stato === "PAGATO").reduce((a, p) => a + p.importo, 0);
  const totDaPagare = lista.filter((p) => p.stato === "DA_PAGARE" || p.stato === "SCADUTO").reduce((a, p) => a + p.importo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamenti ospedalieri</h1>
        <p className="mt-1 text-sm text-gray-500">Riepilogo finanziario di tutte le prestazioni erogate</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Incassato</p>
          <p className="mt-1 text-2xl font-bold text-green-700">€ {totIncassato.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Da incassare</p>
          <p className="mt-1 text-2xl font-bold text-orange-700">€ {totDaPagare.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ v: "", l: "Tutti" }, { v: "DA_PAGARE", l: "Da pagare" }, { v: "PAGATO", l: "Pagati" }, { v: "SCADUTO", l: "Scaduti" }, { v: "RIMBORSATO", l: "Rimborsati" }].map((f) => (
          <button key={f.v} onClick={() => setFiltro(f.v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtro === f.v ? "bg-indigo-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <CreditCard className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessun pagamento trovato</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Paziente</th>
                <th className="px-5 py-3 text-left">Prestazione</th>
                <th className="px-5 py-3 text-left">Reparto</th>
                <th className="px-5 py-3 text-right">Importo</th>
                <th className="px-5 py-3 text-left">Stato</th>
                <th className="px-5 py-3 text-left">Scadenza</th>
                <th className="px-5 py-3 text-left">Pagato il</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.paziente}</td>
                  <td className="px-5 py-3 text-gray-600">{p.prestazione}</td>
                  <td className="px-5 py-3 text-gray-500">{p.reparto}</td>
                  <td className="px-5 py-3 text-right text-gray-700">€ {p.importo.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[p.stato]}`}>
                      {statoLabel[p.stato]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{format(new Date(p.dataScadenza), "d MMM yyyy", { locale: it })}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {p.dataPagamento ? format(new Date(p.dataPagamento), "d MMM yyyy", { locale: it }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
