import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        pathname: '/api/files/**', // Cambia con il tuo dominio in produzione
      },
    ],
  },
};

export default withNextIntl(nextConfig);
