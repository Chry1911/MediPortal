"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  confermaPassword: string;
  codiceFiscale: string;
  dataNascita: string;
  telefono: string;
}

const initial: FormData = {
  nome: "",
  cognome: "",
  email: "",
  password: "",
  confermaPassword: "",
  codiceFiscale: "",
  dataNascita: "",
  telefono: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
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

    // 1. Crea l'utente
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        cognome: form.cognome,
        email: form.email,
        password: form.password,
        codiceFiscale: form.codiceFiscale,
        dataNascita: form.dataNascita,
        telefono: form.telefono || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Errore durante la registrazione.");
      return;
    }

    // 2. Login automatico dopo registrazione
    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      // Registrazione ok ma login fallito — manda al login manuale
      router.push("/auth/login?registered=1");
    } else {
      router.push("/prenotazioni");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo / intestazione */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0v4m0-4h4m-4 0H8" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary-900">MediPortal</h1>
          <p className="text-gray-500 mt-1 text-sm">Portale Sanitario Digitale</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Crea il tuo account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Hai già un account?{" "}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Accedi
            </Link>
          </p>

          {/* Errore */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 11-2 0zm1 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
                <input
                  id="nome" name="nome" type="text" required autoComplete="given-name"
                  value={form.nome} onChange={handleChange} placeholder="Mario"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="cognome" className="block text-sm font-medium text-gray-700 mb-1.5">Cognome</label>
                <input
                  id="cognome" name="cognome" type="text" required autoComplete="family-name"
                  value={form.cognome} onChange={handleChange} placeholder="Rossi"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Indirizzo email</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                value={form.email} onChange={handleChange} placeholder="mario.rossi@esempio.it"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Codice Fiscale */}
            <div>
              <label htmlFor="codiceFiscale" className="block text-sm font-medium text-gray-700 mb-1.5">Codice Fiscale</label>
              <input
                id="codiceFiscale" name="codiceFiscale" type="text" required
                maxLength={16} minLength={16}
                value={form.codiceFiscale} onChange={handleChange} placeholder="RSSMRA80A01H501U"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Data di nascita e Telefono */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataNascita" className="block text-sm font-medium text-gray-700 mb-1.5">Data di nascita</label>
                <input
                  id="dataNascita" name="dataNascita" type="date" required
                  value={form.dataNascita} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefono <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <input
                  id="telefono" name="telefono" type="tel"
                  value={form.telefono} onChange={handleChange} placeholder="+39 333 1234567"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                id="password" name="password" type="password" required minLength={8} autoComplete="new-password"
                value={form.password} onChange={handleChange} placeholder="Minimo 8 caratteri"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Conferma password */}
            <div>
              <label htmlFor="confermaPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Conferma password</label>
              <input
                id="confermaPassword" name="confermaPassword" type="password" required minLength={8} autoComplete="new-password"
                value={form.confermaPassword} onChange={handleChange} placeholder="Ripeti la password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-2.5 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Registrazione in corso…
                </>
              ) : (
                "Crea account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} MediPortal — Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}
