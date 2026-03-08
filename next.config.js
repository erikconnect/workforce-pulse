/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep external runtime packages out of the server bundle.
  serverExternalPackages: ["playwright-core"],
  turbopack: {
    // Avoid incorrect monorepo root inference when multiple lockfiles exist.
    root: __dirname,
  },
};

module.exports = nextConfig;
