/** @type {import('next').NextConfig} */
const nextConfig = {
  //參照https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**', // 這個來源的網址完全開放
      },
    ],
  },
};

export default nextConfig;
