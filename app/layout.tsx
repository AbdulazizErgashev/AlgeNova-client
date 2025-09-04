import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgeNova – Math Solver Engine",
  description:
    "AlgeNova – zamonaviy algebra, tenglamalar, integral va boshqa matematik formulalarga aniq va tezkor yechim topuvchi platforma.",
  generator: "Math.app",
  applicationName: "AlgeNova",
  authors: [{ name: "Nurmuhammad", url: "https://alge-nova.uz/" }],
  keywords: [
    "algebra solver",
    "math equations",
    "AI math",
    "math problem solver",
    "integrals",
    "derivatives",
    "quadratic equation",
    "formulas",
    "matematika yechim",
    "online math help",
  ],
  icons: {
    icon: "/logo without bg.png",
  },
  metadataBase: new URL("https://alge-nova.uz"), // ✅ qo‘shildi
  openGraph: {
    title: "AlgeNova – AI Math Solver",
    description:
      "AI yordamida algebra, tenglamalar, integral, hosila va murakkab matematik formulalarga yechim toping.",
    url: "https://alge-nova.uz/",
    siteName: "AlgeNova",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AlgeNova Math Solver",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgeNova – AI Math Solver",
    description:
      "Matematika muammolarini AI yordamida oson yeching – algebra, integral, tenglamalar va boshqa ko‘plab formulalar!",
    images: ["/og-image.png"],
    creator: "@algenova",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// ✅ themeColor endi viewport ichida
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
