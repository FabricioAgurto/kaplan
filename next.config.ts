/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true, // importante para export
  },
};

module.exports = nextConfig;
