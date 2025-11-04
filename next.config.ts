import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpilar stellar-sdk para que funcione correctamente
  transpilePackages: ['stellar-sdk'],
  // Configurar Turbopack (Next.js 16 usa Turbopack por defecto)
  turbopack: {},
};

export default nextConfig;
