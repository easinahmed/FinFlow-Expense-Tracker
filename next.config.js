/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;