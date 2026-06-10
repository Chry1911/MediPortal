"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Eye, Clock, CheckCircle2, Archive } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Referto {
  id: string;
  titolo: string;
  descrizione: string | null;
  stato: string;
  fileUrl: string;
  dataUpload: string | null;
  prestazione: string;
  reparto: string;
  medico: string;
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

const statoIcon: Record<string, React.ReactNode> = {
  IN_ELABORAZIONE: <Clock className="h-4 w-4 text-yellow-500" />,
  DISPONIBILE:     <CheckCircle2 className="h-4 w-4 text-green-500" />,
  ARCHIVIATO:      <Archive className="h-4 w-4 text-gray-400" />,
};

export default function RefertiPage() {
  const [referti, setReferti] = useState<Referto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [preview, setPreview] = useState<Referto | null>(null);

  useEffect(() => {
    fetch("/api/referti")
      .then((r) => r.json())
      .then((d) => { setReferti(d); setLoading(false); });
  }, []);

  const filtrati = filtro ? referti.filter((r) => r.stato === filtro) : referti;
  const disponibili = referti.filter((r) => r.stato === "DISPONIBILE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referti</h1>
        <p className="mt-1 text-sm text-gray-500">
          {disponibili > 0
            ? `Hai ${disponibili} refert${disponibili === 1 ? "o" : "i"} disponibil${disponibili === 1 ? "e" : "i"}`
            : "I tuoi referti medici"}
        </p>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "", label: "Tutti" },
          { value: "DISPONIBILE", label: "Disponibili" },
          { value: "IN_ELABORAZIONE", label: "In elaborazione" },
          { value: "ARCHIVIATO", label: "Archiviati" },
        ].map((f) => (
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
          <FileText className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessun referto trovato</p>
          <p className="text-xs mt-1">I referti vengono caricati dal medico dopo la visita</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrati.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border bg-white p-5 transition hover:shadow-sm ${
                r.stato === "DISPONIBILE" ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    r.stato === "DISPONIBILE" ? "bg-green-50" : "bg-gray-50"
                  }`}>
                    <FileText className={`h-5 w-5 ${r.stato === "DISPONIBILE" ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statoIcon[r.stato]}
                      <h3 className="font-semibold text-gray-900 truncate">{r.titolo}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statoBadge[r.stato]}`}>
                        {statoLabel[r.stato]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{r.prestazione} · {r.reparto}</p>
                    <p className="text-sm text-gray-500">{r.medico}</p>
                    {r.dataUpload && (
                      <p className="mt-1 text-xs text-gray-400">
                        Caricato il {format(new Date(r.dataUpload), "d MMMM yyyy", { locale: it })}
                      </p>
                    )}
                    {r.descrizione && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{r.descrizione}</p>
                    )}
                  </div>
                </div>

                {r.stato === "DISPONIBILE" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPreview(r)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" /> Dettagli
                    </button>
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <Download className="h-4 w-4" /> Scarica
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale dettaglio */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{preview.titolo}</h2>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Prestazione</p>
                  <p className="mt-0.5 text-gray-900">{preview.prestazione}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reparto</p>
                  <p className="mt-0.5 text-gray-900">{preview.reparto}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Medico</p>
                  <p className="mt-0.5 text-gray-900">{preview.medico}</p>
                </div>
                {preview.dataUpload && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Data</p>
                    <p className="mt-0.5 text-gray-900">
                      {format(new Date(preview.dataUpload), "d MMMM yyyy", { locale: it })}
                    </p>
                  </div>
                )}
              </div>
              {preview.descrizione && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Descrizione</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{preview.descrizione}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Chiudi
                </button>
                <a
                  href={preview.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" /> Scarica PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
