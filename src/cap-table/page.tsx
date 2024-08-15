"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
} from "./state/ConversionState";
import { getRandomData, initialState } from "./state/initialState";
import { decompressState } from "@/utils/stateCompression";
import { createRecentState, getRecentState, updateRecentStates } from "./state/localstorage";
import Worksheet from "./Worksheet";


const Page: React.FC = () => {
  const randomInvestors = useRef<ReturnType<typeof getRandomData>>();
  if (!randomInvestors.current) {
    randomInvestors.current = getRandomData();
  }

  // Keep a state id to save/update the state to local storage
  // We keep multiple states in local storage, so we need to know which one to update
  // Eventually we will expose a way to save and load states
  const [stateId, setStateId] = useState<string>();

  const store = useRef<ConversionStore>();
  if (!store.current) {
    // On the first load, we need to check if there is a hash
    const hash = window.location.hash?.slice(1);
    window.location.hash = "";

    // If we have a hash, it's likely a share URL, so we need to decompress it
    // Then we need to create a new state if it doesn't already exist
    if (hash) {
      try {
        const state = decompressState(hash);
        const [id, newState] = createRecentState(state)
        setStateId(id)
        store.current = createConversionStore(newState);
      } catch (e) {
        console.error("Failed to decompress state", e)
        // Just use a clean state
        const [id, state] = createRecentState(initialState({ ...randomInvestors.current }));
        setStateId(id)
        store.current = createConversionStore(state);
      }
    } else {
      const [id, state] = getRecentState();
      if (id && state) {
        setStateId(id)
        store.current = createConversionStore(state);
      } else {
        const [id, state] = createRecentState(initialState({ ...randomInvestors.current }));
        setStateId(id)
        store.current = createConversionStore(state);
      }
    }

  }


  const state = useStore(store.current);

  window.addEventListener('hashchange', () => {
    // This is the only way to look for hash changes
    const hash = window.location.hash?.slice(1);
    if (hash) {
      try {
        const state = decompressState(hash);
        const [id, newState] = createRecentState(state)
        store.current = createConversionStore(newState);
        setStateId(id)
      } catch (e) {
        console.error("Failed to decompress state", e)
      }
      window.location.hash = "";
    }
  });

  useEffect(() => {
    // Save the state to local storage
    if (stateId) {
      updateRecentStates(stateId, state)
    }
  }, [state, stateId]);


  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between py-8 min-w-[1024px]">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Worksheet conversionState={state} />
        </div>
      </main>
    </div>
  );
};

export default Page;
