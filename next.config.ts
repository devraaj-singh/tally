import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (dev/demo DB fallback) ships its own WASM + Node FS loader.
  // Let it load from node_modules instead of being bundled, otherwise the
  // bundler hands its loader a URL where Node's fs expects a string path
  // (TypeError: The "path" argument ... Received an instance of URL).
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
