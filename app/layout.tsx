import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgeNova – Math Solver Engine",
  description: "AlgeNova – zamonaviy algebra va matematik formulalar yechimi",
  icons: {
    icon: "/logo without bg.png",
  },
  openGraph: {
    title: "AlgeNova – Math Solver Engine",
    description: "Engine yordamida algebra, tenglamalar va integral yechish",
    url: "https://alge-nova.uz/",
    siteName: "AlgeNova",
    images: [
      {
        url: "/logo without bg.png",
        width: 1200,
        height: 630,
        alt: "AlgeNova",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
