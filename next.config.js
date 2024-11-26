/** @type {import('next').NextConfig} */

module.exports = {
    images: {
        remotePatterns: [{
            hostname: 'assets.tina.io'}],
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
