import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [{ source: "/cadastrar", destination: "/ordens/cadastrar", permanent: true }];
  },
};

export default nextConfig;
