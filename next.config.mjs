/** @type {import('next').NextConfig} */
const nextConfig = {
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
