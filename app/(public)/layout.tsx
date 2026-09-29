import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <div data-bgy-info="" />
      <Footer />
      <Script
        src="https://www.bantuguruyuk.web.id/bgy-info.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
