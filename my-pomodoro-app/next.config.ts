/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Para aplicaciones estáticas
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig