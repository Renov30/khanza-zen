import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMRS-KHANZA",
  description: "Sistem Informasi Manajemen Rumah Sakit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-slate-100 text-slate-800">
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
