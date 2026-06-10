"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Prenotazione {
  id: string;
  codice: string;
  dataOra: string;
  stato: string;
  note: string | null;
  prestazione: { nome: string; reparto: string; costo: number; durata: number };
  medico: string;
  pagamento: { id: string; stato: string; importo: number; dataScadenza: string } | null;
  referto: { id: string; stato: string; titolo: string } | null;
}

interface Prestazione { id: string; codice: string; nome: string; reparto: string; durata: number; costo: number }
interface Medico { id: string; nome: string }

const STATI = [
  { value: "", label: "Tutte" },
  { value: "IN_ATTESA", label: "In attesa" },
  { value: "CONFERMATA", label: "Confermate" },
  { value: "COMPLETATA", label: "Completate" },
  { value: "ANNULLATA", label: "Annullate" },
];

const statoBadge: Record<string, string> = {
  IN_ATTESA:  "bg-yellow-100 text-yellow-800",
  CONFERMATA: "bg-blue-100 text-blue-800",
  COMPLETATA: "bg-green-100 text-green-800",
  ANNULLATA:  "bg-red-100 text-red-800",
};

const statoLabel: Record<string, string> = {
  IN_ATTESA:  "In attesa",
  CONFERMATA: "Confermata",
  COMPLETATA: "Completata",
  ANNULLATA:  "Annullata",
};

export default function PrenotazioniPage() {
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);

  function carica(stato = filtro) {
    setLoading(true);
    const url = stato ? `/api/prenotazioni?stato=${stato}` : "/api/prenotazioni";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setPrenotazioni(d); setLoading(false); });
  }

  useEffect(() => { carica(); }, [filtro]);

  async function annulla(id: string) {
    if (!confirm("Vuoi annullare questa prenotazione?")) return;
    await fetch(`/api/prenotazioni/${id}`, { method: "DELETE" });
    carica();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prenotazioni</h1>
          <p className="mt-1 text-sm text-gray-500">Gestisci le tue prenotazioni sanitarie</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" /> Nuova prenotazione
        </button>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {STATI.map((s) => (
          <button
            key={s.value}
            onClick={() => setFiltro(s.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtro === s.value
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : prenotazioni.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <CalendarDays className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">Nessuna prenotazione trovata</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Prenota una visita
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {prenotazioni.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{p.prestazione.nome}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[p.stato]}`}>
                      {statoLabel[p.stato]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {format(new Date(p.dataOra), "d MMMM yyyy, HH:mm", { locale: it })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" /> {p.medico}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {p.prestazione.reparto}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {p.prestazione.durata} min
                    </span>
                  </div>
                  {p.note && <p className="mt-2 text-xs text-gray-400 italic">"{p.note}"</p>}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-base font-bold text-gray-900">€ {p.prestazione.costo.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">#{p.codice.slice(0, 8).toUpperCase()}</p>
                  <div className="flex gap-2 mt-1">
                    {p.pagamento?.stato === "DA_PAGARE" && (
                      <a href="/pagamenti" className="text-xs font-medium text-orange-600 bg-orange-50 rounded px-2 py-1 hover:bg-orange-100">
                        Paga ora
                      </a>
                    )}
                    {p.referto?.stato === "DISPONIBILE" && (
                      <a href="/referti" className="text-xs font-medium text-green-600 bg-green-50 rounded px-2 py-1 hover:bg-green-100">
                        Referto
                      </a>
                    )}
                    {(p.stato === "IN_ATTESA" || p.stato === "CONFERMATA") && (
                      <button
                        onClick={() => annulla(p.id)}
                        className="text-xs font-medium text-red-600 bg-red-50 rounded px-2 py-1 hover:bg-red-100"
                      >
                        Annulla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NuovaPrenotazioneModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); carica(); }}
        />
      )}
    </div>
  );
}

/* ─── Modal nuova prenotazione ─── */
function NuovaPrenotazioneModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const [medici, setMedici] = useState<Medico[]>([]);
  const [form, setForm] = useState({ prestazioneId: "", medicoId: "", dataOra: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/prestazioni").then((r) => r.json()),
      fetch("/api/medici").then((r) => r.json()),
    ]).then(([p, m]) => { setPrestazioni(p); setMedici(m); });
  }, []);

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/prenotazioni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Errore durante la prenotazione"); return; }
    onSuccess();
  }

  // Raggruppa prestazioni per reparto
  const reparti = [...new Set(prestazioni.map((p) => p.reparto))].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Nuova prenotazione</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">{error}</p>
          )}

          {/* Prestazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prestazione</label>
            <select
              name="prestazioneId"
              required
              value={form.prestazioneId}
              onChange={handle}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleziona una prestazione</option>
              {reparti.map((reparto) => (
                <optgroup key={reparto} label={reparto}>
                  {prestazioni
                    .filter((p) => p.reparto === reparto)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — €{Number(p.costo).toFixed(2)} ({p.durata} min)
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Medico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Medico</label>
            <select
              name="medicoId"
              required
              value={form.medicoId}
              onChange={handle}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleziona un medico</option>
              {medici.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          {/* Data e ora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data e ora</label>
            <input
              type="datetime-local"
              name="dataOra"
              required
              value={form.dataOra}
              onChange={handle}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Note <span className="text-gray-400 font-normal">(opzionale)</span>
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handle}
              rows={2}
              placeholder="Eventuali informazioni utili per il medico…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300 transition"
            >
              {loading ? "Prenotazione in corso…" : "Conferma prenotazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
