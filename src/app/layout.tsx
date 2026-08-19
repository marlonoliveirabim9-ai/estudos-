import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estudos PRF — Edital Verticalizado",
  description: "Plataforma pessoal de estudos para o concurso da Polícia Rodoviária Federal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
