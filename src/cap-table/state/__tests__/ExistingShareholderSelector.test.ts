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
    expect(existingShareholders[0].ownership[1].error).toEqual(false);
  });
  test("Check the uncapped SAFE notes result in 'TBD' dilutedPct", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const { rowData, onUpdateRow } = store.getState();
    const row = rowData.find((row) => row.type === "safe")!;

    // Make a bad row
    onUpdateRow({
      ...row,
      cap: 1,
    });

    const existingShareholders = getExistingShareholderPropsSelector(
      store.getState()
    );
    // Ensure the "bad" SAFE note are marked with an error
    expect(existingShareholders[0].ownership[0].error ?? false).toEqual(false);
    expect(existingShareholders[0].ownership[1].error ?? false).toEqual(true);
    expect(existingShareholders[0].ownership[2].error ?? false).toEqual(true);
  });
});
