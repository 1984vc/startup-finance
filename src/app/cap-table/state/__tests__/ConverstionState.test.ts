import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "@/cap-table/state/ConversionState";
import fixtureData from "./fixtures/state_fixtures.json";

describe("Basic ConversionState", () => {
  test("that it passes a sanity check", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const { onAddRow } = store.getState();
    onAddRow("safe");
    expect(store.getState().rowData.length).toEqual(11);
  });
});
