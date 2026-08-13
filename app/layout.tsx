import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BGY Interactive Learning",
    template: "%s | BGY Interactive Learning",
  },
  description:
    "Satu Tempat untuk Media Pembelajaran Interaktif Guru Indonesia.",
  keywords: [
    "media pembelajaran",
    "media interaktif",
    "guru Indonesia",
    "game edukasi",
    "quiz interaktif",
    "Bantu Guru Yuk",
  ],
  openGraph: {
    title: "BGY Interactive Learning",
    description: "Media Pembelajaran Interaktif Karya Guru Indonesia.",
    type: "website",
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
            __html: `(function(){try{var t=localStorage.getItem("bgy-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
