import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const t = await getTranslations("dashboard");

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <section className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">
          {t("welcome")}, {session.user.name}
        </p>

        <div className="mt-6 grid gap-3 text-sm text-gray-700">
          <p>
            <span className="font-medium">{t("email")}:</span> {session.user.email}
          </p>
          <p>
            <span className="font-medium">{t("role")}:</span> {(session.user as any).role}
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/prenotazioni"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            {t("goToBookings")}
          </Link>
          <SignOutButton label={t("logout")} />
        </div>
      </section>
    </main>
  );
}
