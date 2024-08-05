import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "../ConversionState";
import { getExistingShareholderPropsSelector } from "../ExistingShareholderSelector";
import fixtureData from "./fixtures/state_fixtures.json";

describe("Existing Shareholder Selector", () => {
  test("Basic sanity check of selector", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const existingShareholders = getExistingShareholderPropsSelector(
      store.getState(),
    );
    expect(existingShareholders[0].dilutedPct.toFixed(2)).toEqual("31.35");
    expect(existingShareholders[0].dilutedPctError).toEqual(undefined);
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
      store.getState(),
    );
    expect(existingShareholders[0].dilutedPctError).toEqual("TBD");
  });
});
