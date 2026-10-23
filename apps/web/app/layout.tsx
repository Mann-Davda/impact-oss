import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "../lib/locale";

export const metadata: Metadata = {
  title: "ImpactOS — Crisis Decision Support System",
  description: "AI emergency decision-support operating system. From Chaos To Action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased flex flex-col selection:bg-alert/30">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
