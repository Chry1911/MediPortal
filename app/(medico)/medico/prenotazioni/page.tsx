"use client";

import { useEffect, useState } from "react";
import { CalendarDays, User, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Prenotazione {
  id: string; codice: string; dataOra: string; stato: string; note: string | null;
  paziente: { id: string; nomeCompleto: string; codiceFiscale: string; dataNascita: string; telefono: string | null };
  prestazione: { nome: string; reparto: string; durata: number; costo: number };
  pagamento: string | null;
  referto: { id: string; stato: string; titolo: string } | null;
}

const STATI = ["", "IN_ATTESA", "CONFERMATA", "COMPLETATA", "ANNULLATA"];
const statoBadge: Record<string, string> = {
  IN_ATTESA: "bg-yellow-100 text-yellow-800", CONFERMATA: "bg-blue-100 text-blue-800",
  COMPLETATA: "bg-green-100 text-green-800",  ANNULLATA: "bg-red-100 text-red-800",
};
const statoLabel: Record<string, string> = {
  IN_ATTESA: "In attesa", CONFERMATA: "Confermata", COMPLETATA: "Completata", ANNULLATA: "Annullata",
};
const TRANSIZIONI: Record<string, string[]> = {
  IN_ATTESA: ["CONFERMATA", "ANNULLATA"],
  CONFERMATA: ["COMPLETATA", "ANNULLATA"],
  COMPLETATA: [], ANNULLATA: [],
};

export default function MedicoPrenotazioniPage() {
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [espanso, setEspanso] = useState<string | null>(null);
  const [aggiornando, setAggiornando] = useState<string | null>(null);

  function carica() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroStato) params.set("stato", filtroStato);
    if (filtroData) params.set("data", filtroData);
    fetch(`/api/medico/prenotazioni?${params}`)
      .then((r) => r.json())
      .then((d) => { setPrenotazioni(d); setLoading(false); });
  }

  useEffect(() => { carica(); }, [filtroStato, filtroData]);

  async function aggiornaStato(id: string, stato: string) {
    setAggiornando(id);
    await fetch(`/api/medico/prenotazioni/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stato }),
    });
    setAggiornando(null);
    carica();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Le mie prenotazioni</h1>
        <p className="mt-1 text-sm text-gray-500">Gestisci e aggiorna lo stato delle visite</p>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {STATI.map((s) => (
            <button key={s}
              onClick={() => setFiltroStato(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtroStato === s ? "bg-slate-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-slate-400"
              }`}>
              {s === "" ? "Tutte" : statoLabel[s]}
            </button>
          ))}
        </div>
        <input
          type="date" value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        {filtroData && (
          <button onClick={() => setFiltroData("")} className="text-sm text-gray-400 hover:text-gray-600">
            × Rimuovi data
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
        </div>
      ) : prenotazioni.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <CalendarDays className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessuna prenotazione trovata</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prenotazioni.map((p) => {
            const aperta = espanso === p.id;
            const transizioni = TRANSIZIONI[p.stato] ?? [];
            return (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Header riga */}
                <button
                  onClick={() => setEspanso(aperta ? null : p.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="text-sm font-bold text-gray-900">{format(new Date(p.dataOra), "d MMM", { locale: it })}</p>
                    <p className="text-xs text-gray-500">{format(new Date(p.dataOra), "HH:mm")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 truncate">{p.paziente.nomeCompleto}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">{p.prestazione.nome} · {p.prestazione.reparto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[p.stato]}`}>
                      {statoLabel[p.stato]}
                    </span>
                    {p.referto && <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Refertato</span>}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${aperta ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Dettaglio espanso */}
                {aperta && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                      <InfoBox label="Paziente" value={p.paziente.nomeCompleto} />
                      <InfoBox label="CF" value={p.paziente.codiceFiscale} mono />
                      <InfoBox label="Data nascita" value={format(new Date(p.paziente.dataNascita), "d MMM yyyy", { locale: it })} />
                      <InfoBox label="Telefono" value={p.paziente.telefono ?? "—"} />
                      <InfoBox label="Prestazione" value={p.prestazione.nome} />
                      <InfoBox label="Reparto" value={p.prestazione.reparto} />
                      <InfoBox label="Durata" value={`${p.prestazione.durata} min`} />
                      <InfoBox label="Costo" value={`€ ${p.prestazione.costo.toFixed(2)}`} />
                    </div>
                    {p.note && (
                      <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">"{p.note}"</p>
                    )}

                    {/* Azioni stato */}
                    {transizioni.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        <span className="text-xs text-gray-500 self-center">Aggiorna stato:</span>
                        {transizioni.map((t) => (
                          <button key={t}
                            disabled={aggiornando === p.id}
                            onClick={() => aggiornaStato(p.id, t)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                              t === "ANNULLATA"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : t === "COMPLETATA"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}>
                            {aggiornando === p.id ? "…" : statoLabel[t]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Carica referto */}
                    {p.stato === "COMPLETATA" && !p.referto && (
                      <div className="pt-2 border-t border-gray-200">
                        <a href={`/medico/referti?prenotazioneId=${p.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
                          Carica referto per questa visita
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`mt-0.5 text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
