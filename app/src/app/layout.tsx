import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenHouse - AI Showing Assistant for Real Estate Agents",
  description: "Automate property research, AI-vet listings for red flags, and let clients book showings instantly. Save 4 hours per client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#050507] text-slate-300`}>
        {children}
      </body>
    </html>
  );
}
