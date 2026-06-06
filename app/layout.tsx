import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediPortal — Portale Sanitario Digitale",
  description: "Prenota, paga e gestisci i tuoi referti online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
