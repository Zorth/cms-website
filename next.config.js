/** @type {import('next').NextConfig} */

module.exports = {
    images: {
        domains: ['assets.tina.io'],
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
