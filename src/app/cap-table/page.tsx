"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
} from "./state/ConversionState";
import { getRandomData, initialState } from "./state/initialState";
import { compressState, decompressState } from "@/utils/stateCompression";
import { getRecentState, updateRecentStates } from "./state/localstorage";
import Worksheet from "./Worksheet";
import { getSerializedSelector } from "./state/selectors/SerializeSelector";
import { generateUUID } from "@/utils/uuid";


const Page: React.FC = () => {
  // Keep a state id to save/update the state to local storage
  // We keep multiple states in local storage, so we need to know which one to update
  // Eventually we will expose a way to save and load states
  const [stateId] = useState<string>(generateUUID(16));
  const [initialPageLoad, setInitialPageLoad] = useState<boolean>(true);

  const storeRef = useRef<ConversionStore>();
  if (storeRef.current === undefined) {
    storeRef.current = createConversionStore(initialState({ ...getRandomData() }));
  }

  const state = useStore(storeRef.current);

  const stateHash = compressState(getSerializedSelector(state));

  const freshPageState = (findRecent: boolean) => {
    if (findRecent) {
      const recentState = getRecentState()
      if (recentState) {
        storeRef.current?.setState(recentState);
      }
      updateRecentStates(stateId, state);
      window.location.hash = compressState(getSerializedSelector(recentState ?? initialState({ ...getRandomData() })));
    }
  };

  const handleHash = (hash: string) => {
    try {
      if (hash.length === 0) {
        freshPageState(true);
      } else if (hash.charAt(0) === "A" && initialPageLoad) {
        const state = decompressState(hash);
        updateRecentStates(stateId, state);
        setInitialPageLoad(false);
        storeRef.current?.setState(state);
      } else if (hash.charAt(0) === "I") {
        const state = decompressState(hash.slice(1));
        if (state) {
          updateRecentStates(stateId, state);
          storeRef.current?.setState(state);
          window.location.hash = compressState(getSerializedSelector(state));
        } else {
          freshPageState(false);
        }
      } else {
        freshPageState(false);
      }

    } catch (error) {
      console.error(error);
      freshPageState(false);
    }
  }

  const hashChangesListenerRef = useRef<boolean>(false);
  if (!hashChangesListenerRef.current) {
    hashChangesListenerRef.current = true;
    window.addEventListener("hashchange", () => {
      handleHash(window.location.hash.slice(1));
    });
    hashChangesListenerRef.current = true;
    handleHash(window.location.hash.slice(1));
  }

  useEffect(() => {
    window.location.hash = stateHash;
  }, [state, stateHash]);

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between py-8 min-w-[1024px]">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Worksheet conversionState={state} currentStateId={stateId} />
        </div>
      </main>
    </div>
  );
};

export default Page;
