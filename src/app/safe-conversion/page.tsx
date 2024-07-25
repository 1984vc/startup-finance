"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Conversion from "../components/safe-conversion/Conversion/Conversion";
import Link from "next/link";

const Page: React.FC = () => {

  // We use random values which gets the DOM out of sync SS vs Client in development
  // This is a hack to make sure the DOM is in sync and prevent hydration flashing of different random values
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [ready])

  if (!ready) {
    return
  }

  return (
    <div>
      <Link href="https://1984.vc">
        <Image
          src="/startup-finance/images/logo.svg"
          alt="1984 Logo"
          className="dark:invert p-8"
          width={90}
          height={90}
          priority
        />
      </Link>
      <main className="flex min-h-screen flex-col items-center justify-between px-24 py-8">
        <h1 className="text-xl">1984 SAFE Conversion Worksheet</h1>
        <h2 className="text-orange-700">
          Warning: Beta version, expect changes
        </h2>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Conversion />
        </div>
      </main>
      <div className="flex justify-center p-8 my-4">
        <div className="text-sm text-gray-500">
          Copyright 2024 <Link className="text-blue-600 hover:text-blue-800" href="https://1984.vc">1984 Ventures</Link> - {""}
          <Link className="text-blue-600 hover:text-blue-800" href="https://github.com/1984vc/startup-finance/blob/main/PRIVACY.md">Privacy Policy</Link> - {""}
          <Link className="text-blue-600 hover:text-blue-800" href="https://github.com/1984vc/startup-finance/blob/main/TOS.md">Terms of Service</Link> - {""}
          <Link className="text-blue-600 hover:text-blue-800" href="https://github.com/1984vc/startup-finance">Github</Link></div>
      </div>
    </div>
  );
};

export default Page;
