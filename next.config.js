/** @type {import('next').NextConfig} */

module.exports = {
    images: {
        remotePatterns: [
            {
                hostname: 'assets.tina.io',
            },
            {
                hostname: 'img.clerk.com',
            },
        ],
    },
  async rewrites() {
    return [
      // {
      //   source: "/",
      //   destination: "/home",
      // },
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ];
  },
}
