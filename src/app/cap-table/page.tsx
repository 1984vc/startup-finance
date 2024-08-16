"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
  IConversionState,
  IConversionStateData,
} from "./state/ConversionState";
import { getRandomData, initialState } from "./state/initialState";
import { compressState, decompressState } from "@/utils/stateCompression";
import { updateOrCreatedRecentState, getRecentState, updateRecentStates, getMachineId} from "./state/localstorage";
import Worksheet from "./Worksheet";
import { getSerializedSelector } from "./state/selectors/SerializeSelector";


const Page: React.FC = () => {

  const storeRef = useRef<ConversionStore>(createConversionStore(initialState({ ...getRandomData() }, getMachineId())));
  const hashRef = useRef<string>("");
  const stateIdRef = useRef<string>();
  const hashChangeListenerSetRef = useRef<boolean>(false);
  const [worksheetState, setWorksheetState] = useState<IConversionState>(useStore(storeRef.current));

  const loadPageState = (state: IConversionStateData) => {
    const store = createConversionStore(state);
    storeRef.current = store
    const savedState = updateOrCreatedRecentState(getSerializedSelector(store.getState()));
    updateUrlState(savedState)
  }

  const blankPageState = (findRecent: boolean) => {
    if (findRecent) {
      const state = getRecentState();
      if (state) {
        const store = createConversionStore(state);
        storeRef.current = store
        updateUrlState(state)
        return
      }
    }
    const store = createConversionStore(initialState({ ...getRandomData() }, getMachineId()));
    storeRef.current = store
    const savedState = updateOrCreatedRecentState(getSerializedSelector(store.getState()));
    updateUrlState(savedState)
  }

  const updateUrlState = (state: IConversionStateData) => {
    console.log("Updating URL", state.id);
    const hash = compressState(state)
    hashRef.current = hash
    window.location.hash = hash
    stateIdRef.current = state.id
  }

  // Called everytime we see a hash change and on first load
  const handleHash = (hash: string) => {
    // Only update if the hash has changed
    if (hashRef.current.length > 0 && hashRef.current === hash) {
      return
    }
    if (hash.charAt(0) === "A") {
      const state = decompressState(hash);
      // If the state Id changes, then we have an entirely new state (user clicked on a link to a new state)
      if (state.id !== stateIdRef.current) {
        console.log("Loading new state", state.id, stateIdRef.current);
        storeRef.current.setState(state);
        setWorksheetState(storeRef.current.getState());
      }
    } else if (hash === "new") {
      blankPageState(false)
    } else {
      blankPageState(true)
    }
    hashRef.current = hash
  }

  if (!storeRef.current) {
    // On the first load, we need to check the hash (or lack thereof)
    handleHash(window.location.hash.slice(1));
  }


  // Only set the listener once
  if (!hashChangeListenerSetRef.current) {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash?.slice(1);
      handleHash(hash);
    });
    hashChangeListenerSetRef.current = true
  }

  const onUpdate = (state: IConversionStateData) => {
    const serializedState = getSerializedSelector(state);
    // Save the state to local storage
    updateOrCreatedRecentState(getSerializedSelector(state));
    // Update the URL
    updateUrlState(serializedState);
  }

  useEffect(() => {
    console.log("state changed", worksheetState.id);
  }, [worksheetState]);


  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between py-8 min-w-[1024px]">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          { worksheetState &&
            <Worksheet conversionState={worksheetState} />
          }
        </div>
      </main>
    </div>
  );
};

export default Page;
