import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PHProvider from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1984 SAFE Conversion Worksheet",
  description: "A tool to help you calculate SAFE conversions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PHProvider>
        <body className={inter.className}>{children}</body>
      </PHProvider>
    </html>
  );
}
