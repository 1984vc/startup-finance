import { IConversionStateData } from "@/cap-table/state/ConversionState";


type LocalStorageConversionStateData = IConversionStateData & {
  createdAt: number;
  updatedAt: number;
}

export const updateLocalStorage = (state: IConversionStateData) => {
  const stateString = window.localStorage.getItem("states")
  let states: LocalStorageConversionStateData[] = [];
  if (stateString !== null && stateString.length > 0) {
    try {
      states = JSON.parse(stateString);
    } catch (e) {
      console.error("Error parsing states from local storage", e);
    }
  }
  const sortedByUpdatedAt = states.sort((a, b) => b.updatedAt - a.updatedAt);
  const existingStateIdx = sortedByUpdatedAt.findIndex((s) => s.id === state.id);
  if (existingStateIdx !== -1) {
    sortedByUpdatedAt[existingStateIdx] = {
      ...state,
      updatedAt: Date.now(),
      createdAt: sortedByUpdatedAt[existingStateIdx].createdAt,
    };
  } else {
    sortedByUpdatedAt.push({
      ...state,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  window.localStorage.setItem("states", JSON.stringify(sortedByUpdatedAt.slice(0, 5)));
}

export const getLocalStorage = (): LocalStorageConversionStateData[] => {
  const stateString = window.localStorage.getItem("states")
  let states: LocalStorageConversionStateData[] = [];
  if (stateString !== null && stateString.length > 0) {
    try {
      states = JSON.parse(stateString);
    } catch (e) {
      console.error("Error parsing states from local storage", e);
    }
  }
  return states;
}