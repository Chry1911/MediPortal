"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, Stethoscope, FileText, LogOut, Cross } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/medico/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/medico/prenotazioni", label: "Prenotazioni", icon: CalendarDays },
  { href: "/medico/prestazioni",  label: "Prestazioni",  icon: Stethoscope },
  { href: "/medico/referti",      label: "Referti",      icon: FileText },
];

export default function SidebarMedico() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
          <Cross className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">MediPortal</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Area Medico</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Esci
        </button>
      </div>
    </aside>
  );
}
