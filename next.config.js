/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.clicafe.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.mercadopago.com https://http2.mlstatic.com;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig