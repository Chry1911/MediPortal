"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";

interface FormData {
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNascita: string;
  email: string;
  telefono: string;
  password: string;
  confermaPassword: string;
  accettaTermini: boolean;
}

function checkPassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const authT = useTranslations("auth");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: "",
    cognome: "",
    codiceFiscale: "",
    dataNascita: "",
    email: "",
    telefono: "",
    password: "",
    confermaPassword: "",
    accettaTermini: false,
  });

  const pw = checkPassword(form.password);
  const pwValid = pw.minLength && pw.hasUppercase && pw.hasNumber;

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!pwValid) {
      setError(t("passwordRulesError"));
      return;
    }

    if (form.password !== form.confermaPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!form.accettaTermini) {
      setError(t("termsError"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          cognome: form.cognome,
          codiceFiscale: form.codiceFiscale.toUpperCase(),
          dataNascita: form.dataNascita,
          email: form.email,
          telefono: form.telefono || undefined,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? data.error ?? t("genericError"));
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex justify-end">
          <LocaleSwitcher />
        </div>

        <div className="flex flex-col items-center mb-6">
          <h1 className="text-xl font-medium text-gray-900">{authT("brand")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("title")}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("name")}</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={update("nome")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("surname")}</label>
                <input
                  type="text"
                  required
                  value={form.cognome}
                  onChange={update("cognome")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("taxCode")}</label>
              <input
                type="text"
                required
                maxLength={16}
                value={form.codiceFiscale}
                onChange={update("codiceFiscale")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("birthDate")}</label>
              <input
                type="date"
                required
                value={form.dataNascita}
                onChange={update("dataNascita")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                {t("phone")} <span className="font-normal text-gray-400">{t("optional")}</span>
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={update("telefono")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={update("password")}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{t("confirmPassword")}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confermaPassword}
                  onChange={update("confermaPassword")}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {form.password && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">{t("requirementsTitle")}</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>{pw.minLength ? "✓" : "○"} {t("reqMinLength")}</li>
                  <li>{pw.hasUppercase ? "✓" : "○"} {t("reqUpper")}</li>
                  <li>{pw.hasNumber ? "✓" : "○"} {t("reqNumber")}</li>
                </ul>
              </div>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={form.accettaTermini}
                onChange={update("accettaTermini")}
                className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-blue-600"
              />
              <span className="text-xs text-gray-500">{t("terms")}</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? t("loading") : t("submit")}
            </button>

            <p className="text-center text-xs text-gray-500">
              {t("alreadyAccount")}{" "}
              <Link href="/auth/login" className="text-blue-700 font-medium hover:underline">
                {t("loginLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
