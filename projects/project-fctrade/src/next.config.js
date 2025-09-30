/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    
    // 添加生产环境优化
    if (config.mode === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      }
    }
    
    return config
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略类型检查错误
    ignoreBuildErrors: true,
  },
    // 添加压缩选项
    swcMinify: true,
  // 添加压缩配置
  compress: true,
  // 添加生产环境配置
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 