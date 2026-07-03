import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Trigger config reload for postcss configuration update
  turbopack: {
    root: join(__dirname, "../.."),
  },
  outputFileTracingRoot: join(__dirname, "../.."),
};

export default nextConfig;
