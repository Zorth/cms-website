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
}
