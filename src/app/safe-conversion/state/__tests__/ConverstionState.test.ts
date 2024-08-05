import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "../ConversionState";
import fixtureData from "./fixtures/state_fixtures.json";

describe("Basic ConversionState", () => {
  test("that it passes a sanity check", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const { onAddRow, togglePricedRound } = store.getState();
    onAddRow("safe");
    expect(store.getState().rowData.length).toEqual(11);
    togglePricedRound(true);
    expect(store.getState().hasNewRound).toEqual(true);
  });
});
