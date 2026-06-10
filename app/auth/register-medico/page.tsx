"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cross } from "lucide-react";

interface Form {
  nome: string; cognome: string; email: string;
  password: string; confermaPassword: string;
  codiceFiscale: string; dataNascita: string;
  telefono: string; secret: string;
}

const initial: Form = {
  nome: "", cognome: "", email: "", password: "", confermaPassword: "",
  codiceFiscale: "", dataNascita: "", telefono: "", secret: "",
};

export default function RegisterMedicoPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confermaPassword) {
      setError("Le password non coincidono.");
      return;
    }
    if (form.codiceFiscale.length !== 16) {
      setError("Il codice fiscale deve essere di 16 caratteri.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register-medico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome, cognome: form.cognome, email: form.email,
        password: form.password, codiceFiscale: form.codiceFiscale,
        dataNascita: form.dataNascita, telefono: form.telefono || undefined,
        secret: form.secret,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.message ?? "Errore durante la registrazione."); return; }
    router.push("/auth/login?registered=1");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 mb-4 shadow-lg">
            <Cross className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">MediPortal</h1>
          <p className="text-gray-500 mt-1 text-sm">Registrazione Medico</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl px-8 py-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Crea account medico</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sei un paziente?{" "}
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Registrati qui
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome" name="nome" value={form.nome} onChange={handle} placeholder="Giuseppe" required />
              <Field label="Cognome" name="cognome" value={form.cognome} onChange={handle} placeholder="Verdi" required />
            </div>
            <Field label="Email professionale" name="email" type="email" value={form.email} onChange={handle} placeholder="dott.verdi@ospedale.it" required />
            <Field label="Codice Fiscale" name="codiceFiscale" value={form.codiceFiscale} onChange={handle}
              placeholder="VRDGPP75B15F205X" maxLength={16} className="uppercase tracking-widest" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data di nascita" name="dataNascita" type="date" value={form.dataNascita} onChange={handle} required />
              <Field label="Telefono (opz.)" name="telefono" type="tel" value={form.telefono} onChange={handle} placeholder="+39 333 1234567" />
            </div>
            <Field label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 8 caratteri" required />
            <Field label="Conferma password" name="confermaPassword" type="password" value={form.confermaPassword} onChange={handle} placeholder="Ripeti la password" required />

            {/* Codice di registrazione */}
            <div className="pt-2 border-t border-gray-100">
              <Field
                label="Codice di accesso medico"
                name="secret"
                type="password"
                value={form.secret}
                onChange={handle}
                placeholder="Fornito dall'amministratore"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Richiedi il codice all'amministratore del sistema.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-lg text-sm transition mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Registrazione…</>
              ) : "Crea account medico"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} MediPortal
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, required, maxLength, className = "" }: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; maxLength?: number; className?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} maxLength={maxLength}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition ${className}`}
      />
    </div>
  );
}
