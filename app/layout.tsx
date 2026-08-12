import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indonesië Reis",
  description: "Gedeelde reisplanner voor de Indonesië-trip",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen text-slate-900 antialiased">{children}</body>
    </html>
  );
}
