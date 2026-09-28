import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bantu Guru Yuk | Media Belajar",
    template: "%s | BGY - Media Belajar",
  },
  description:
    "Media Belajar Interaktif Karya Guru Indonesia — menemukan, menggunakan, dan berbagi media pembelajaran.",
  keywords: [
    "media pembelajaran",
    "media interaktif",
    "guru Indonesia",
    "game edukasi",
    "quiz interaktif",
    "Bantu Guru Yuk",
  ],
  openGraph: {
    title: "Bantu Guru Yuk | Media Belajar",
    description: "Media Belajar Interaktif Karya Guru Indonesia.",
    type: "website",
    images: ["/icon.png"],
  },
  themeColor: "#0ea5a0",
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
