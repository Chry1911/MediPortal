"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Receipt } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Pagamento {
  id: string;
  importo: number;
  stato: string;
  metodoPagamento: string | null;
  dataScadenza: string;
  dataPagamento: string | null;
  ricevutaUrl: string | null;
  prenotazione: {
    id: string;
    codice: string;
    dataOra: string;
    prestazione: string;
    reparto: string;
    medico: string;
  };
}

const statoBadge: Record<string, string> = {
  DA_PAGARE:  "bg-orange-100 text-orange-800",
  PAGATO:     "bg-green-100 text-green-800",
  RIMBORSATO: "bg-blue-100 text-blue-800",
  SCADUTO:    "bg-red-100 text-red-800",
};

const statoLabel: Record<string, string> = {
  DA_PAGARE:  "Da pagare",
  PAGATO:     "Pagato",
  RIMBORSATO: "Rimborsato",
  SCADUTO:    "Scaduto",
};

const statoIcon: Record<string, React.ReactNode> = {
  DA_PAGARE:  <Clock className="h-4 w-4 text-orange-500" />,
  PAGATO:     <CheckCircle2 className="h-4 w-4 text-green-500" />,
  RIMBORSATO: <Receipt className="h-4 w-4 text-blue-500" />,
  SCADUTO:    <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const METODI = ["Carta di credito", "Carta di debito", "Bonifico", "Contanti"];

export default function PagamentiPage() {
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [pagando, setPagando] = useState<string | null>(null);
  const [metodo, setMetodo] = useState("Carta di credito");
  const [processing, setProcessing] = useState(false);

  function carica() {
    setLoading(true);
    fetch("/api/pagamenti")
      .then((r) => r.json())
      .then((d) => { setPagamenti(d); setLoading(false); });
  }

  useEffect(() => { carica(); }, []);

  async function effettuaPagamento(id: string) {
    setProcessing(true);
    const res = await fetch(`/api/pagamenti/${id}/paga`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metodoPagamento: metodo }),
    });
    setProcessing(false);
    setPagando(null);
    if (res.ok) carica();
  }

  const filtrati = filtro ? pagamenti.filter((p) => p.stato === filtro) : pagamenti;

  const totDaPagare = pagamenti.filter((p) => p.stato === "DA_PAGARE").reduce((a, p) => a + p.importo, 0);
  const totPagato = pagamenti.filter((p) => p.stato === "PAGATO").reduce((a, p) => a + p.importo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamenti</h1>
        <p className="mt-1 text-sm text-gray-500">Gestisci i pagamenti delle tue prestazioni sanitarie</p>
      </div>

      {/* Riepilogo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Da pagare</p>
          <p className="mt-1 text-2xl font-bold text-orange-700">€ {totDaPagare.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Pagato</p>
          <p className="mt-1 text-2xl font-bold text-green-700">€ {totPagato.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "", label: "Tutti" }, { value: "DA_PAGARE", label: "Da pagare" }, { value: "PAGATO", label: "Pagati" }, { value: "SCADUTO", label: "Scaduti" }].map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtro === f.value
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtrati.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <CreditCard className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessun pagamento trovato</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrati.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {statoIcon[p.stato]}
                    <h3 className="font-semibold text-gray-900">{p.prenotazione.prestazione}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[p.stato]}`}>
                      {statoLabel[p.stato]}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-sm text-gray-500">
                    <p>{p.prenotazione.medico} · {p.prenotazione.reparto}</p>
                    <p>Visita: {format(new Date(p.prenotazione.dataOra), "d MMM yyyy, HH:mm", { locale: it })}</p>
                    <p>Scadenza pagamento: {format(new Date(p.dataScadenza), "d MMM yyyy", { locale: it })}</p>
                    {p.dataPagamento && (
                      <p className="text-green-600">
                        Pagato il {format(new Date(p.dataPagamento), "d MMM yyyy", { locale: it })}
                        {p.metodoPagamento && ` — ${p.metodoPagamento}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <p className="text-xl font-bold text-gray-900">€ {p.importo.toFixed(2)}</p>
                  {(p.stato === "DA_PAGARE" || p.stato === "SCADUTO") && (
                    <button
                      onClick={() => setPagando(p.id)}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Paga ora
                    </button>
                  )}
                </div>
              </div>

              {/* Modal pagamento inline */}
              {pagando === p.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Metodo di pagamento</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {METODI.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMetodo(m)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          metodo === m
                            ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPagando(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Annulla
                    </button>
                    <button
                      onClick={() => effettuaPagamento(p.id)}
                      disabled={processing}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing ? "Elaborazione…" : `Paga € ${p.importo.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
