import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cookie Clicker - Jogo de Biscoitos",
  description: "Um divertido jogo Cookie Clicker feito com Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
