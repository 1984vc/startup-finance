import { IConversionStateData } from "@/cap-table/state/ConversionState";
import { generateUUID } from "@/utils/uuid";
import hash  from "object-hash";


const MAX_RECENT_STATES = 10;
const RECENT_STATES_KEY = "recent_v1";

const hashObject = (obj: any) => {
  return hash(obj, { algorithm: "sha1" });
}

export type LocalStorageConversionStateData = {
  id: string;
  stateString: string;
  hash: string;
  createdAt: number;
  updatedAt: number;
}

// Get the most recent states from local storage
const getRecentStates = (): LocalStorageConversionStateData[] => {
  const recentSerialized = window.localStorage.getItem(RECENT_STATES_KEY)
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
  const stateString = JSON.stringify(state);
  const idx = recents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    recents[idx] = {
      ...recents[idx],
      stateString,
      hash: hashObject(state),
      updatedAt: Date.now(),
    }
    window.localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents));
  } else {
    console.log("Could not find state to update, creating", id, state);
    recents.push({
      id,
      stateString: JSON.stringify(state),
      hash: hashObject(state),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    })
    window.localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_RECENT_STATES)));
  }
}

// The secret sauce here is that we only need create a new state IF it doesn't already exist (a state with the same hash)
export const createRecentState = (state: IConversionStateData): [id: string, state: IConversionStateData] => {
  const recents = getRecentStates();
  const hash = hashObject(state)
  const existingState = recents.find((s) => s.hash === hash);
  if (existingState) {
    console.log("Found existing state", existingState.id, state);
    return [existingState.id, state]
  } else {
    const id = generateUUID(16);
    console.log("Creating new state", id);
    recents.push({
      id,
      hash,
      stateString: JSON.stringify(state),
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
    return [mostRecent.id, JSON.parse(mostRecent.stateString)]
  }
  return [undefined, undefined];
}

// If we show up with nothing, find the most recent state, or return undefined
export const findRecentState = (id: string): IConversionStateData => {
  const recents = getRecentStates();
  const found = recents.find((s) => s.id === id);
  if (found) {
    return JSON.parse(found.stateString);
  }
  throw new Error(`Could not find state with id ${id}`);
}
