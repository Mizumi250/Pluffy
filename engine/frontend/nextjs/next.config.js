/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.43.1'], // your hotspot IP
  experimental: {
    forceSwcTransforms: false,
  },
  webpack(config) {
    // Enable async WebAssembly for Rapier2D/3D and other WASM modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    // Treat .wasm files as async webassembly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })
    return config
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://127.0.0.1:8000/storage/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ]
  },
}
export default nextConfig
