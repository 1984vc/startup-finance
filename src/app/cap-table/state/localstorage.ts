import { IConversionStateData } from "@/cap-table/state/ConversionState";
import { generateUUID } from "@/utils/uuid";

// Simply store the most recent states in local storage

const MAX_RECENT_STATES = 10;
const RECENT_STATES_KEY = "recent_v5";

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

export type LocalStorageConversionStateData = {
  conversionState: IConversionStateData;
  createdAt: number;
  updatedAt: number;
}

// Prevents someone from "losing" their state when they share a link and someone shares it back with changes.
export const getMachineId = (): string => {
  let machineId = localStorage.getItem("machineId");
  if (machineId === null) {
    machineId = generateUUID(16);
    localStorage.setItem("machineId", machineId);
  }
  return machineId;
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

// Get the most recent states from local storage
export const updateOrCreatedRecentState = (state: IConversionStateData): IConversionStateData => {
  const recents = getRecentStates();
  // See if we have a match, this is a worksheet from our machine
  const match = recents.find((s) => state.id === s.conversionState.id && state.mId === s.conversionState.mId);
  if (match) {
    updateRecentStates(state)
    return state;
  }

  // Otherwise, we need to create a new state and add it to the local storage
  const id = generateUUID(16);
  const mId = getMachineId();
  const newState = {
    ...state,
    id,
    mId,
  }
  updateRecentStates(newState);
  return newState;
}


// Update the most recent states in local storage by id
export const updateRecentStates = (state:IConversionStateData) => {
  const recents = getRecentStates();
  const idx = recents.findIndex((s) => state.id === s.conversionState.id && state.mId === s.conversionState.mId);
  if (idx !== -1) {
    recents[idx] = {
      ...recents[idx],
      conversionState: state,
      updatedAt: Date.now(),
    }
    localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents));
  } else {
    console.log("Could not find state to update, creating:", state.mId, state.id);
    recents.push({
      conversionState: state,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    })
    localStorage.setItem(RECENT_STATES_KEY, JSON.stringify(recents.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_RECENT_STATES)));
  }
}

// If we show up with nothing, find the most recent state, or return undefined
export const getRecentState = (): IConversionStateData | undefined => {
  const recents = getRecentStates();
  if (recents.length > 0) {
    const mostRecent = recents.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return mostRecent.conversionState
  }
  return undefined;
}
