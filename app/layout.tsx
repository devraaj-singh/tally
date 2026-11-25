import type { Metadata, Viewport } from "next";
import { inter, sora } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tally",
  description: "A lean spending tracker.",
  appleWebApp: { capable: true, title: "Tally", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
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
