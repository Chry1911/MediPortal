"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, X, CheckCircle2, Clock, Archive } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PrenotazioneDaRefertare {
  id: string;
  codice: string;
  dataOra: string;
  paziente: string;
  prestazione: string;
  reparto: string;
}

interface Referto {
  id: string;
  titolo: string;
  descrizione: string | null;
  stato: string;
  fileUrl: string;
  dataUpload: string | null;
  prestazione: string;
  reparto: string;
  paziente?: string;
  prenotazioneId: string;
}

const statoBadge: Record<string, string> = {
  IN_ELABORAZIONE: "bg-yellow-100 text-yellow-800",
  DISPONIBILE:     "bg-green-100 text-green-800",
  ARCHIVIATO:      "bg-gray-100 text-gray-600",
};

const statoLabel: Record<string, string> = {
  IN_ELABORAZIONE: "In elaborazione",
  DISPONIBILE:     "Disponibile",
  ARCHIVIATO:      "Archiviato",
};

export default function MedicoRefertiPage() {
  const [referti, setReferti] = useState<Referto[]>([]);
  const [daRefertare, setDaRefertare] = useState<PrenotazioneDaRefertare[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PrenotazioneDaRefertare | null>(null);
  const [form, setForm] = useState({ titolo: "", descrizione: "", fileUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Leggo i parametri dalla URL per pre-selezionare una prenotazione
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("prenotazioneId");
    carica(pid ?? undefined);
  }, []);

  async function carica(prenotazioneIdDaAprire?: string) {
    setLoading(true);
    const [refertiRes, prenotazioniRes] = await Promise.all([
      fetch("/api/medico/referti-list"),
      fetch("/api/medico/prenotazioni?stato=COMPLETATA"),
    ]);
    const refertiData = refertiRes.ok ? await refertiRes.json() : [];
    const prenotazioniData = prenotazioniRes.ok ? await prenotazioniRes.json() : [];

    // Prenotazioni COMPLETATA senza referto
    const senzaReferto = prenotazioniData.filter((p: any) => !p.referto);
    setDaRefertare(
      senzaReferto.map((p: any) => ({
        id: p.id,
        codice: p.codice,
        dataOra: p.dataOra,
        paziente: p.paziente.nomeCompleto,
        prestazione: p.prestazione.nome,
        reparto: p.prestazione.reparto,
      }))
    );
    setReferti(refertiData);
    setLoading(false);

    // Se arrivato dalla pagina prenotazioni con un ID specifico
    if (prenotazioneIdDaAprire) {
      const target = senzaReferto.find((p: any) => p.id === prenotazioneIdDaAprire);
      if (target) {
        apriModal({
          id: target.id,
          codice: target.codice,
          dataOra: target.dataOra,
          paziente: target.paziente.nomeCompleto,
          prestazione: target.prestazione.nome,
          reparto: target.prestazione.reparto,
        });
      }
    }
  }

  function apriModal(p: PrenotazioneDaRefertare) {
    setForm({ titolo: `Referto ${p.prestazione}`, descrizione: "", fileUrl: "" });
    setError("");
    setModal(p);
  }

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    if (!form.fileUrl.trim()) { setError("Inserisci l'URL o il percorso del file PDF."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/medico/referti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenotazioneId: modal.id,
        titolo: form.titolo,
        descrizione: form.descrizione || undefined,
        fileUrl: form.fileUrl,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Errore durante il salvataggio"); return; }
    setModal(null);
    carica();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referti</h1>
        <p className="mt-1 text-sm text-gray-500">Carica i referti per le visite completate</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : (
        <>
          {/* Da refertare */}
          {daRefertare.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertIcon /> Da refertare ({daRefertare.length})
              </h2>
              <div className="space-y-2">
                {daRefertare.map((p) => (
                  <div key={p.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{p.paziente}</p>
                      <p className="text-xs text-gray-500">
                        {p.prestazione} · {p.reparto} ·{" "}
                        {format(new Date(p.dataOra), "d MMM yyyy", { locale: it })}
                      </p>
                    </div>
                    <button
                      onClick={() => apriModal(p)}
                      className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 flex-shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" /> Carica referto
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referti caricati */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Referti caricati ({referti.length})
            </h2>
            {referti.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-12 text-gray-400">
                <FileText className="h-10 w-10 mb-2" />
                <p className="text-sm">Nessun referto caricato</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referti.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">{r.titolo}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[r.stato]}`}>
                          {statoLabel[r.stato]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{r.prestazione} · {r.reparto}</p>
                      {r.dataUpload && (
                        <p className="text-xs text-gray-400">
                          {format(new Date(r.dataUpload), "d MMM yyyy", { locale: it })}
                        </p>
                      )}
                    </div>
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary-600 hover:underline flex-shrink-0"
                    >
                      Apri PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal carica referto */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Carica referto</h2>
                <p className="text-sm text-gray-500">{modal.paziente} · {modal.prestazione}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={salva} className="p-6 space-y-4">
              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titolo referto</label>
                <input
                  type="text" required value={form.titolo}
                  onChange={(e) => setForm((p) => ({ ...p, titolo: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  URL / percorso file PDF
                </label>
                <input
                  type="text" required value={form.fileUrl}
                  onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))}
                  placeholder="/uploads/referti/referto-visita.pdf"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Inserisci il percorso del file PDF già caricato sul server.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note cliniche <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <textarea
                  rows={3} value={form.descrizione}
                  onChange={(e) => setForm((p) => ({ ...p, descrizione: e.target.value }))}
                  placeholder="Osservazioni, diagnosi, indicazioni terapeutiche…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setModal(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Salvataggio…" : "Carica referto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
