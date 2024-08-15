"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
  IConversionStateData,
} from "./state/ConversionState";
import { getRandomData, initialState } from "./state/initialState";
import { decompressState } from "@/utils/stateCompression";
import { createRecentState, findRecentState, getRecentState, updateRecentStates } from "./state/localstorage";
import Worksheet from "./Worksheet";
import { getSerializedSelector } from "./state/SerializeSelector";


const Page: React.FC = () => {
  // Keep a state id to save/update the state to local storage
  // We keep multiple states in local storage, so we need to know which one to update
  // Eventually we will expose a way to save and load states
  const [stateId, setStateId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const storeRef = useRef<ConversionStore>();
  const hashChangeListenerSetRef = useRef<boolean>(false);

  const updatePageState = (state: IConversionStateData) => {
    const store = createConversionStore(state);
    storeRef.current = store
    const [id] = createRecentState(getSerializedSelector(state));
    setStateId(id)
    window.location.hash = "I" + id;
  }

  const blankPageState = (findRecent: boolean) => {
    if (findRecent) {
      const [id, state] = getRecentState();
      if (id && state) {
        const store = createConversionStore(state);
        storeRef.current = store
        setStateId(id)
        window.location.hash = "I" + id;
        return
      }
    }
    console.log("Creating new state", initialState({ ...getRandomData() }));
    const store = createConversionStore(initialState({ ...getRandomData() }));
    storeRef.current = store
    const [id] = createRecentState(getSerializedSelector(store.getState()));
    setStateId(id)
    window.location.hash = "I" + id;
  }

  // Called everytime we see a hash change and on first load
  const handleHash = (hash: string) => {
    if (hash.charAt(0) === "I") {
      const id = hash.slice(1)
      const state = findRecentState(id)
      console.log("Found state", id, state);
      if (state) {
        storeRef.current = createConversionStore(state);
        setStateId(id)
        window.location.hash = "I" + id;
      } else {
        updatePageState(initialState({...getRandomData() }))
      }
    } else if (hash.charAt(0) === "A") {
      const state = decompressState(hash);
      updatePageState(state)
    } else if (hash === "new") {
      blankPageState(false)
    } else {
      blankPageState(true)
    }
    setLoading(false);
  }

  if (!storeRef.current) {
    // On the first load, we need to check the hash (or lack thereof)
    handleHash(window.location.hash.slice(1));
  }

  const worksheetState = useStore(storeRef.current!);

  if (!hashChangeListenerSetRef.current) {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash?.slice(1);
      // This is the only way to look for hash changes
      setLoading(true);
      handleHash(hash);
    });
    hashChangeListenerSetRef.current = true
  }

  useEffect(() => {
    if (stateId) {
      updateRecentStates(stateId, getSerializedSelector(worksheetState));
    }
  }, [worksheetState, stateId]);



  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between py-8 min-w-[1024px]">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          { !loading && stateId && 
            <Worksheet conversionState={worksheetState} id={stateId} />
          }
        </div>
      </main>
    </div>
  );
};

export default Page;
