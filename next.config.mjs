/** @type {import('next').NextConfig} */
const nextConfig = {
  // File game statis harus selalu dicek ulang agar pembaruan langsung terlihat (tidak tersangkut cache browser)
  async headers() {
    return [
      { source: "/games/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] },
    ];
  },
  async redirects() {
    return [
      // Domain lama -> domain baru (halaman saja). /api dan /_next dibiarkan agar
      // pemanggil lama dari luar situs tidak putus.
      {
        source: "/:path((?!api/|_next/).*)",
        has: [{ type: "host", value: "bmedia.bantuguruyuk.web.id" }],
        destination: "https://main-yuk.my.id/:path",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "bmedia.bantuguruyuk.web.id" }],
        destination: "https://main-yuk.my.id/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
