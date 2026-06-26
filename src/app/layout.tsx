import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Star OS — Gestão de Contratos",
  description: "Sistema de Gestão de Contratos de Aluguel para Licitações",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full dark`}>
      <body className="min-h-full antialiased bg-[#0a0b10] text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
