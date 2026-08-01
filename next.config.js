/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'jose'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'jose'],
  },
};

module.exports = nextConfig;
