import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "@/cap-table/state/ConversionState";
import { getExistingShareholderPropsSelector } from "@/cap-table/state/ExistingShareholderSelector";
import fixtureData from "./fixtures/state_fixtures.json";

describe("Existing Shareholder Selector", () => {
  test("Basic sanity check of selector", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const existingShareholders = getExistingShareholderPropsSelector(
      store.getState(),
    );
    expect(existingShareholders[0].ownership[1].percent.toFixed(2)).toEqual("31.35");
    expect(existingShareholders[0].ownership[1].error).toEqual(undefined);
  });
  test("Check the uncapped SAFE notes result in 'TBD' dilutedPct", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const { rowData, onUpdateRow } = store.getState();
    const row = rowData.find((row) => row.type === "safe")!;
    onUpdateRow({
      ...row,
      cap: 0,
    });

    const existingShareholders = getExistingShareholderPropsSelector(
      store.getState()
    );
    // Check the uncapped SAFE notes result in 'TBD' ownership in the second row
    expect(existingShareholders[0].ownership[1].error).toEqual("TBD");
    // Check the uncapped SAFE notes has no error on the third row, becaue the priced round sets the cap
    expect(existingShareholders[0].ownership[2].error).toEqual(undefined);
  });
});
