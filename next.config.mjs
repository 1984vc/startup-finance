import path from "path";

const basePathName = "startup-finance";
let distDir = "out";
if (process.env.BUILD_DIST !== undefined) {
  distDir = path.join(process.env.BUILD_DIST, basePathName);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: `/${basePathName}`,
  distDir,
  output: "export",
};

export default nextConfig;
