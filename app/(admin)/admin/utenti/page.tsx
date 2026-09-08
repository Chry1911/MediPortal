"use client";

import { useEffect, useState } from "react";
import { Plus, X, Users, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Utente {
  id: string; nome: string; cognome: string; email: string;
  codiceFiscale: string; dataNascita: string; telefono: string | null;
  ruolo: "PAZIENTE" | "MEDICO" | "ADMIN"; createdAt: string;
  _count: { prenotazioni: number; prenotazioniMedico: number };
}

const ruoloBadge: Record<string, string> = {
  PAZIENTE: "bg-sky-100 text-sky-800",
  MEDICO: "bg-purple-100 text-purple-800",
  ADMIN: "bg-indigo-100 text-indigo-800",
};

const ruoloLabel: Record<string, string> = {
  PAZIENTE: "Paziente", MEDICO: "Medico", ADMIN: "Amministratore",
};

const emptyForm = {
  nome: "", cognome: "", email: "", password: "", codiceFiscale: "",
  dataNascita: "", telefono: "", ruolo: "PAZIENTE" as Utente["ruolo"],
};

export default function AdminUtentiPage() {
  const [lista, setLista] = useState<Utente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modalNuovo, setModalNuovo] = useState(false);
  const [modalModifica, setModalModifica] = useState<Utente | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function carica() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtro) params.set("ruolo", filtro);
    fetch(`/api/admin/utenti?${params}`)
      .then((r) => r.json())
      .then((d) => { setLista(d); setLoading(false); });
  }

  useEffect(() => { carica(); }, [filtro]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function creaUtente(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch("/api/admin/utenti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Errore durante il salvataggio"); return; }
    setModalNuovo(false); setForm(emptyForm); carica();
  }

  async function cambiaRuolo(u: Utente, ruolo: string) {
    await fetch(`/api/admin/utenti/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruolo }),
    });
    setModalModifica(null); carica();
  }

  async function elimina(u: Utente) {
    if (!confirm(`Eliminare l'utente ${u.nome} ${u.cognome}?`)) return;
    const res = await fetch(`/api/admin/utenti/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Impossibile eliminare l'utente"); return; }
    carica();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utenti</h1>
          <p className="mt-1 text-sm text-gray-500">Gestione di pazienti, medici e amministratori</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setError(""); setModalNuovo(true); }}
          className="flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">
          <Plus className="h-4 w-4" /> Nuovo utente
        </button>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {[{ v: "", l: "Tutti" }, { v: "PAZIENTE", l: "Pazienti" }, { v: "MEDICO", l: "Medici" }, { v: "ADMIN", l: "Amministratori" }].map((f) => (
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
          <Users className="h-12 w-12 mb-3" />
          <p className="text-sm">Nessun utente trovato</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Nome</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Ruolo</th>
                <th className="px-5 py-3 text-left">Registrato il</th>
                <th className="px-5 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.nome} {u.cognome}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ruoloBadge[u.ruolo]}`}>
                      {ruoloLabel[u.ruolo]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{format(new Date(u.createdAt), "d MMM yyyy", { locale: it })}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModalModifica(u)} className="p-1.5 text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => elimina(u)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuovo utente */}
      {modalNuovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Nuovo utente</h2>
              <button onClick={() => setModalNuovo(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={creaUtente} className="p-6 space-y-4">
              {error && <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
                <Field label="Cognome" name="cognome" value={form.cognome} onChange={handleChange} required />
              </div>
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Codice fiscale" name="codiceFiscale" value={form.codiceFiscale} onChange={handleChange} required maxLength={16} />
                <Field label="Data di nascita" name="dataNascita" type="date" value={form.dataNascita} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefono (opzionale)" name="telefono" value={form.telefono} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ruolo</label>
                  <select name="ruolo" value={form.ruolo} onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="PAZIENTE">Paziente</option>
                    <option value="MEDICO">Medico</option>
                    <option value="ADMIN">Amministratore</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalNuovo(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Annulla
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-700 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50">
                  {saving ? "Salvataggio…" : "Crea utente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal modifica ruolo */}
      {modalModifica && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Modifica ruolo</h2>
              <button onClick={() => setModalModifica(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                {modalModifica.nome} {modalModifica.cognome} — <span className="text-gray-400">{modalModifica.email}</span>
              </p>
              <div className="flex flex-col gap-2">
                {(["PAZIENTE", "MEDICO", "ADMIN"] as const).map((r) => (
                  <button key={r} onClick={() => cambiaRuolo(modalModifica, r)}
                    disabled={modalModifica.ruolo === r}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium text-left transition ${
                      modalModifica.ruolo === r
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-indigo-400"
                    }`}>
                    {ruoloLabel[r]} {modalModifica.ruolo === r && "(attuale)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required, maxLength }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} maxLength={maxLength}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
