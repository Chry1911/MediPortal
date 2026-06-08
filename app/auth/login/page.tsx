"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const brand = useTranslations("auth")("brand");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registered = searchParams.get("registered") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (res?.error) {
      setError(t("invalidCredentials"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LocaleSwitcher />
        </div>

        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-900">{brand}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("title")}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {registered && (
              <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700">
                {t("registeredSuccess")}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs text-gray-500 mb-1.5 font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-gray-500 mb-1.5 font-medium">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
                />
                {t("rememberMe")}
              </label>
              <span className="text-xs text-blue-700">{t("forgotPassword")}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? t("loading") : t("submit")}
            </button>

            <p className="text-center text-xs text-gray-500">
              {t("noAccount")}{" "}
              <Link href="/auth/register" className="text-blue-700 font-medium hover:underline">
                {t("registerLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
