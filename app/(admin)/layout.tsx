import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
