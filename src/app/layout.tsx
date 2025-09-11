import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyBank - Banca Digitale Semplificata",
  description:
    "Progetto universitario per il corso di Informatica per le Aziende Digitali. Sistema bancario completo con gestione conti e transazioni.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#c9a961" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
