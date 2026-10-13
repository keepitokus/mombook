import type { Metadata } from "next";
import { sokolovDemoBook } from "../../lib/premium/sokolov-demo";
import "./premium.css";

const { seo } = sokolovDemoBook;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  robots: seo.noindex ? { index: false, follow: false } : undefined,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Мамина история — премиальная демо-книга",
    description: seo.description,
    images: [seo.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Мамина история — премиальная демо-книга",
    description: seo.description,
    images: [seo.ogImage],
  },
};

export default function PremiumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
