// app/page.tsx — Homepage pubblica / redirect al login
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  redirect("/auth/login");
}
