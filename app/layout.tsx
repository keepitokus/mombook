import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Мама, спасибо - демо-книга | Я здесь",
  description:
    "Интерактивная демо-книга ко Дню матери для проекта «Я здесь»: главы жизни, фото, голоса, видео и письмо.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Мама, спасибо - демо-книга",
    description: "Интерактивный пример персональной цифровой книги о маме.",
    images: ["/mamina-istoriya-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
