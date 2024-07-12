/** @type {import('next').NextConfig} */
import path from "path";

const basePath = "/startup-finance";
let distDir = "out";
if (process.env.NODE_ENV === "production") {
  distDir = path.join("..", "build", "startup-finance");
}

const nextConfig = {
  basePath,
  assetPrefix: basePath,
  distDir,
  output: "export",
};

export default nextConfig;
