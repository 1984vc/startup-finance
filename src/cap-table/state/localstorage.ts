import { IConversionStateData } from "@/cap-table/state/ConversionState";
import { compressState, decompressState } from "@/utils/stateCompression";
import { generateUUID } from "@/utils/uuid";


// This handles the most recent X states that have been created or used
//
// When user loads a page with a stateHash, we should save it to local storage as a new document
// When a state is created or used, it should be added to the list of recent states
// When we see a state that has been used, we should update the updatedAt timestamp

// When a state


// getRecentState() => [id, state]
// updateRecentState(id, state) => void
// findRecentState(id) => state

// The secret sauce here is that we only need create a new state IF it doesn't already exist (a state with the same hash)
// createRecentState(state) => [id, state]


export type LocalStorageConversionStateData = {
  id: string;
  hashState: string;
  createdAt: number;
  updatedAt: number;
}

// Get the most recent states from local storage
const getRecentStates = (): LocalStorageConversionStateData[] => {
  const recentSerialized = window.localStorage.getItem("recent")
  let recents: LocalStorageConversionStateData[] = [];
  if (recentSerialized !== null && recentSerialized.length > 0) {
    try {
      recents = JSON.parse(recentSerialized);
    } catch (e) {
      console.error("Error parsing states from local storage", e);
    }
  }
  return recents
}


// Update the most recent states in local storage by id
export const updateRecentStates = (id:string, state:IConversionStateData) => {
  const recents = getRecentStates();
  const hash = compressState(state);
  const idx = recents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    recents[idx] = {
      ...recents[idx],
      hashState: hash,
      updatedAt: Date.now(),
    }
    window.localStorage.setItem("recent", JSON.stringify(recents));
  } else {
    console.log("Could not find state to update, creating", id, state);
    recents.push({
      id,
      hashState: hash,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    })
    window.localStorage.setItem("recent", JSON.stringify(recents));
  }
}

// The secret sauce here is that we only need create a new state IF it doesn't already exist (a state with the same hash)
export const createRecentState = (state: IConversionStateData): [id: string, state: IConversionStateData] => {
  const recents = getRecentStates();
  const hash = compressState(state);
  const existingState = recents.find((s) => s.hashState === hash);
  if (existingState) {
    console.log("Found existing state", existingState.id, state);
    return [existingState.id, state]
  } else {
    const id = generateUUID(16);
    console.log("Creating new state", id);
    recents.push({
      id,
      hashState: hash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    updateRecentStates(id, state);
    return [id, state];
  }
}

// If we show up with nothing, find the most recent state, or return undefined
export const getRecentState = (): [id: string|undefined, state:IConversionStateData | undefined] => {
  const recents = getRecentStates();
  if (recents.length > 0) {
    const mostRecent = recents.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return [mostRecent.id, decompressState(mostRecent.hashState)]
  }
  return [undefined, undefined];
}

// If we show up with nothing, find the most recent state, or return undefined
export const findRecentState = (id: string): IConversionStateData => {
  const recents = getRecentStates();
  const found = recents.find((s) => s.id === id);
  if (found) {
    return decompressState(found?.hashState)
  }
  throw new Error(`Could not find state with id ${id}`);
}
