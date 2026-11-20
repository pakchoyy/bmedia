import type { Metadata } from "next";
import { Fredoka, Nunito_Sans } from "next/font/google";
import "./globals.css";

// Sistem tipografi Main-yuk: Fredoka (judul/logo) + Nunito Sans (isi)
const display = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-rounded", "'Segoe UI'", "system-ui", "sans-serif"],
});

const body = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Main-yuk — Belajar Jadi Seru",
    template: "%s · Main-yuk",
  },
  description:
    "Media Belajar Interaktif Karya Guru Indonesia — menemukan, menggunakan, dan berbagi media pembelajaran.",
  keywords: [
    "media pembelajaran",
    "media interaktif",
    "guru Indonesia",
    "game edukasi",
    "quiz interaktif",
    "Main-yuk",
  ],
  openGraph: {
    title: "Main-yuk — Belajar Jadi Seru",
    description: "Media Belajar Interaktif Karya Guru Indonesia.",
    type: "website",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("bgy-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
