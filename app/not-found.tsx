import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-[1200px] px-6 py-24 text-center fade-in">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">
        Media yang Anda cari tidak ditemukan atau belum disetujui.
      </p>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 bg-primary-light text-white px-8 py-3 rounded-full font-semibold hover:bg-primary transition-colors"
      >
        <Icon name="arrow-left" />
        Kembali ke Katalog
      </Link>
    </div>
  );
}
