"use client";

import React from "react";
import Image from "next/image";
import Conversion from "../components/safe-conversion/Conversion";

const Page: React.FC = () => {
  return (
    <div>
      <Image
        src="/startup-finance/images/logo.svg"
        alt="1984 Logo"
        className="dark:invert p-8"
        width={90}
        height={90}
        priority
      />
      <main className="flex min-h-screen flex-col items-center justify-between px-24 py-8">
        <h1 className="text-xl">1984 SAFE Conversion Worksheet</h1>
        <h2 className="text-orange-700">
          Warning: Beta version, expect changes
        </h2>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Conversion />
        </div>
      </main>
    </div>
  );
};

export default Page;
