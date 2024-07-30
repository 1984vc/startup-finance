import { describe, expect, test } from "@jest/globals";
import { createConversionStore } from "../ConversionState";
import { getRandomData, initialState } from "../initialState";

describe("Basic ConversionState", () => {
  test("that it passes a sanity check", () => {
    const store = createConversionStore(initialState({ ...getRandomData() }));
    const { onAddRow, togglePricedRound } = store.getState();
    onAddRow("safe");
    expect(store.getState().rowData.length).toEqual(11);
    togglePricedRound(true);
    expect(store.getState().hasNewRound).toEqual(true);
  });
});
