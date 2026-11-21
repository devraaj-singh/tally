import type { Metadata } from "next";
import { inter, sora } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tally",
  description: "A lean spending tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sora.variable} bg-white font-sans text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
