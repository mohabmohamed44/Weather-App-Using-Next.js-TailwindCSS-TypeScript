// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
      },
      {
        protocol: "https",
        hostname: "weatherapi.com",
      },
      {
        protocol: "http",
        hostname: "weatherapi.com",
      },
      {
        protocol: "https",
        hostname: "cdn.weatherapi.com",
      },
      {
        protocol: "http",
        hostname: "cdn.weatherapi.com",
      },
      {
        protocol: "http",
        hostname: "api.weatherapi.com",
      },
    ],
  },
};

export default nextConfig;
