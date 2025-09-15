// Without this plugin, the app will crash because it cannot find the Prisma's query engine
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  async redirects() {
    return [
      {
        // Redirect the original Next.js whatsapp.hyperjump.tech /api/notify end point just in case ther are still some people who are using it
        source: "/api/notify",
        destination: `${process.env.NEXT_PUBLIC_MONIKA_NOTIFY_API_URL}/api/notify`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
