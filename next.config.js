/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado para desarrollo - descomentar solo para build de producción
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
};

module.exports = nextConfig;