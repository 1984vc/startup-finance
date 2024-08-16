import { IConversionStateData } from "@/cap-table/state/ConversionState";
import { generateUUID } from "@/utils/uuid";
import hash  from "object-hash";

// Simply store the most recent states in local storage

const MAX_RECENT_STATES = 10;
const RECENT_STATES_KEY = "recent_v4";

// Some browsers don't support local storage with certain settings, so we need to mock it
// This breaks the recent state functionality, but it's better than nothing
// Safari, I'm looking at you
const mockLocalStorageData: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => {
    return mockLocalStorageData[key] ?? null;
  },
  setItem: (key: string, value: string) => {
    mockLocalStorageData[key] = value;
  },
  removeItem: (key: string) => {
    delete mockLocalStorageData[key];
  }
};

const hasLocalStorage = typeof window !== "undefined" && window.localStorage !== undefined;
export const localStorageWorks = (() => {
  if (!hasLocalStorage) return false
  window.localStorage.setItem("safariTest", "1")
  return window.localStorage.getItem("safariTest") === "1";
})()

const localStorage = localStorageWorks ? window.localStorage : mockLocalStorage;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hashObject = (obj: any) => {
  return hash(obj, { algorithm: "sha1" });
}

export type LocalStorageConversionStateData = {
  id: string;
  conversionState: IConversionStateData;
  hash: string;
  createdAt: number;
  updatedAt: number;
}

// Get the most recent states from local storage
export const getRecentStates = (): LocalStorageConversionStateData[] => {
  const recentSerialized = localStorage.getItem(RECENT_STATES_KEY)
  let recents: LocalStorageConversionStateData[] = [];
  if (recentSerialized !== null && recentSerialized.length > 0) {
    try {
      try {
        const items = JSON.parse(recentSerialized) as LocalStorageConversionStateData[];
        recents = items.sort((a, b) => b.updatedAt - a.updatedAt);
      } catch (e) {
        // If we have an error parsing, we should remove the item in order to start fresh
        console.error("Error parsing states from local storage", e);
        localStorage.removeItem(RECENT_STATES_KEY);
      }
    } catch (e) {
      console.error("Error parsing states from local storage", e);
    }
  }
  return recents
}


// Update the most recent states in local storage by id
export const updateRecentStates = (id:string, state:IConversionStateData) => {
  const recents = getRecentStates();
  const idx = recents.findIndex((s) => s.id === id);
  if (idx !== -1) {
    recents[idx] = {
      ...recents[idx],
      conversionState: state,
      hash: hashObject(state),
      updatedAt: Date.now(),
    }
    localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents));
  } else {
    console.log("Could not find state to update, creating", id, state);
    recents.push({
      id,
      conversionState: state,
      hash: hashObject(state),
      updatedAt: Date.now(),
      createdAt: Date.now(),
    })
    localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_RECENT_STATES)));
  }
}

// The secret sauce here is that we only need create a new state IF it doesn't already exist (a state with the same hash)
export const createRecentState = (state: IConversionStateData): [id: string, state: IConversionStateData] => {
  const recents = getRecentStates();
  const hash = hashObject(state)
  const id = generateUUID(16);
  console.log("Creating new state", id);
  recents.push({
    id,
    hash,
    conversionState: state,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  updateRecentStates(id, state);
  return [id, state];
}

// If we show up with nothing, find the most recent state, or return undefined
export const getRecentState = (): [id: string|undefined, state:IConversionStateData | undefined] => {
  const recents = getRecentStates();
  if (recents.length > 0) {
    const mostRecent = recents.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return [mostRecent.id, mostRecent.conversionState]
  }
  return [undefined, undefined];
}

// If we show up with nothing, find the most recent state, or return undefined
export const findRecentState = (id: string): IConversionStateData | null => {
  const recents = getRecentStates();
  const found = recents.find((s) => s.id === id);
  if (found) {
    return found.conversionState;
  }
  return null
}
