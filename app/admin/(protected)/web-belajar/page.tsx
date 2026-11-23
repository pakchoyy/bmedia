import { getWebLinks } from "@/lib/links";
import WebLinkManager from "@/components/admin/WebLinkManager";

export const dynamic = "force-dynamic";

export default async function AdminWebBelajarPage() {
  const links = await getWebLinks();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Web Belajar Lain</h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
          Tautan web pihak ketiga yang tampil di beranda (3 teratas) dan halaman /web-belajar.
        </p>
      </div>
      <WebLinkManager links={links} />
    </div>
  );
}
