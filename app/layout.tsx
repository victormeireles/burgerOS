import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BurgerOS",
  description: "Sistema operacional da hamburgueria com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
