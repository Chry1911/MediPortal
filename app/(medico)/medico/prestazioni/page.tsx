"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, ToggleLeft, ToggleRight, Stethoscope } from "lucide-react";

interface Prestazione {
  id: string; codice: string; nome: string; descrizione: string | null;
  reparto: string; durata: number; costo: number; attiva: boolean;
  _count: { prenotazioni: number };
}

const emptyForm = { codice: "", nome: "", descrizione: "", reparto: "", durata: 30, costo: 0 };

export default function MedicPrestazioniPage() {
  const [lista, setLista] = useState<Prestazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Prestazione | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function carica() {
    setLoading(true);
    fetch("/api/medico/prestazioni")
      .then((r) => r.json())
      .then((d) => { setLista(d); setLoading(false); });
  }

  useEffect(() => { carica(); }, []);

  function apriNuova() { setForm(emptyForm); setEditTarget(null); setError(""); setModal("new"); }
  function apriModifica(p: Prestazione) {
    setForm({ codice: p.codice, nome: p.nome, descrizione: p.descrizione ?? "", reparto: p.reparto, durata: p.durata, costo: p.costo });
    setEditTarget(p); setError(""); setModal("edit");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  }

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const isEdit = modal === "edit" && editTarget;
    const res = await fetch(
      isEdit ? `/api/medico/prestazioni/${editTarget!.id}` : "/api/medico/prestazioni",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, durata: Number(form.durata), costo: Number(form.costo) }),
      }
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Errore durante il salvataggio"); return; }
    setModal(null); carica();
  }

  async function toggleAttiva(p: Prestazione) {
    await fetch(`/api/medico/prestazioni/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attiva: !p.attiva }),
    });
    carica();
  }

  const reparti = [...new Set(lista.map((p) => p.reparto))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prestazioni</h1>
          <p className="mt-1 text-sm text-gray-500">Catalogo delle prestazioni sanitarie disponibili</p>
        </div>
        <button onClick={apriNuova}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">
          <Plus className="h-4 w-4" /> Nuova prestazione
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
          <Stethoscope className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">Nessuna prestazione nel catalogo</p>
          <button onClick={apriNuova} className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
            Aggiungi la prima
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reparti.map((reparto) => (
            <div key={reparto}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">{reparto}</h2>
              <div className="space-y-2">
                {lista.filter((p) => p.reparto === reparto).map((p) => (
                  <div key={p.id} className={`rounded-xl border bg-white p-4 flex items-center gap-4 ${p.attiva ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${p.attiva ? "bg-slate-100" : "bg-gray-50"}`}>
                      <Stethoscope className={`h-5 w-5 ${p.attiva ? "text-slate-600" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
                        <span className="text-xs text-gray-400 font-mono">{p.codice}</span>
                        {!p.attiva && <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">Disattiva</span>}
                      </div>
                      {p.descrizione && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.descrizione}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{p.durata} min</span>
                        <span>€ {p.costo.toFixed(2)}</span>
                        <span>{p._count.prenotazioni} prenotazioni</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => apriModifica(p)} className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-50 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleAttiva(p)} title={p.attiva ? "Disattiva" : "Attiva"}
                        className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-50 rounded">
                        {p.attiva ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal === "new" ? "Nuova prestazione" : `Modifica: ${editTarget?.nome}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={salva} className="p-6 space-y-4">
              {error && <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Codice" name="codice" value={form.codice} onChange={handleChange}
                  placeholder="VIS-CARD-001" required disabled={modal === "edit"} />
                <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange}
                  placeholder="Visita Cardiologica" required />
              </div>
              <FormField label="Reparto" name="reparto" value={form.reparto} onChange={handleChange}
                placeholder="Cardiologia" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrizione (opzionale)</label>
                <textarea name="descrizione" value={form.descrizione} onChange={handleChange} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                  placeholder="Descrizione della prestazione…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Durata (minuti)" name="durata" type="number" value={String(form.durata)}
                  onChange={handleChange} min="5" max="480" required />
                <FormField label="Costo (€)" name="costo" type="number" value={String(form.costo)}
                  onChange={handleChange} min="0" step="0.01" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Annulla
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50">
                  {saving ? "Salvataggio…" : modal === "new" ? "Crea prestazione" : "Salva modifiche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, required, type = "text", min, max, step, disabled }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string;
  min?: string; max?: string; step?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        required={required} min={min} max={max} step={step} disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
