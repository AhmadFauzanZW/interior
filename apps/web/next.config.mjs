/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@interior/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
  serverExternalPackages: ["postgres", "@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],
};

export default nextConfig;
