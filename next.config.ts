import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // Em producao (Vercel), sem basePath. Em dev local, usa proxy
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // Permitir imagens externas (QR Code, fotos de grupos)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Otimizacoes para Vercel
  experimental: {
    // Habilitar cache de dados
  },
};

export default nextConfig;
