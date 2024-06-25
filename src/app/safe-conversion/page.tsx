"use client";

import React from "react";
import Conversion from "../components/safe-conversion/Conversion";

const Page: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Conversion />
      </div>
    </main>
  );
};

export default Page;
