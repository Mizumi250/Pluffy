/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.43.1'], // your hotspot IP
  experimental: {
    // Tree-shake heavy packages
    optimizePackageImports: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'pixi.js',
      '@babylonjs/core',
      'playcanvas',
      'phaser',
      'matter-js',
      'lottie-react',
      'konva',
      'fabric',
      'gsap',
      'lucide-react',
    ],
  },
  webpack(config, { dev }) {
    // Enable async WebAssembly for Rapier2D/3D and other WASM modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'chunk-three',
            priority: 40,
            reuseExistingChunk: true,
          },
          babylon: {
            test: /[\\/]node_modules[\\/]@babylonjs[\\/]/,
            name: 'chunk-babylon',
            priority: 40,
            reuseExistingChunk: true,
          },
          phaser: {
            test: /[\\/]node_modules[\\/]phaser[\\/]/,
            name: 'chunk-phaser',
            priority: 40,
            reuseExistingChunk: true,
          },
          shaders: {
            test: /[\\/]node_modules[\\/]shaders[\\/]/,
            name: 'chunk-shaders',
            priority: 40,
            reuseExistingChunk: true,
          },
          graphics: {
            test: /[\\/]node_modules[\\/](pixi\.js|playcanvas|matter-js|p5|ogl|regl|twgl\.js|konva|fabric|curtainsjs)[\\/]/,
            name: 'chunk-graphics',
            priority: 30,
            reuseExistingChunk: true,
          },
          particles: {
            test: /[\\/]node_modules[\\/](proton-engine|@tsparticles|lottie-react|canvas-confetti)[\\/]/,
            name: 'chunk-particles',
            priority: 30,
            reuseExistingChunk: true,
          },
        },
      }
    }

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
