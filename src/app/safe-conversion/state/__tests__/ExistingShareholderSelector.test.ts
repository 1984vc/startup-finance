import { describe, expect, test } from "@jest/globals";
import { createConversionStore } from "../ConversionState";
import { getRandomData, initialState } from "../initialState";
import { getExistingShareholderPropsSelector } from "../ExistingShareholderSelector";
import { useStore } from "zustand";
import { on } from "events";

describe("Existing Shareholder Selector", () => {
  test("Basic sanity check of selector", () => {
    const store = createConversionStore(initialState({ ...getRandomData() }));
    const existingShareholders = getExistingShareholderPropsSelector(store.getState());
    expect(existingShareholders[0].dilutedPct.toFixed(2)).toEqual("34.34");
    expect(existingShareholders[0].dilutedPctError).toEqual(undefined);
  });
  test("Check the uncapped SAFE notes result in 'TBD' dilutedPct", () => {
    const store = createConversionStore(initialState({ ...getRandomData() }));
    const { rowData, onUpdateRow } = store.getState();
    const row = rowData.find((row) => row.type === "safe")!;
    onUpdateRow({
      ...row,
      cap: 0
    });

    const existingShareholders = getExistingShareholderPropsSelector(store.getState());
    expect(existingShareholders[0].dilutedPctError).toEqual("TBD");
  });
});
