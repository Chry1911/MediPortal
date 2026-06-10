// app/page.tsx — redirect intelligente in base al ruolo
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const role = (session.user as any).role;

  if (role === "MEDICO") redirect("/medico/dashboard");
  if (role === "ADMIN")  redirect("/dashboard");

  // PAZIENTE (default)
  redirect("/dashboard");
}
