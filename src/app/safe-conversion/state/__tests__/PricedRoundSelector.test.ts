import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "../ConversionState";
import { getPriceRoundPropsSelector } from "../PricedRoundSelector";
import fixtureData from "./fixtures/state_fixtures.json";

// Test our Result Selector, which handles both showing the resulting cap table and allow users to play around with the pre-money and investment changes
describe("Result Selector", () => {
  test("Basic sanity check of selector", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const resultSelector = getPriceRoundPropsSelector({
      ...store.getState(),
      hasNewRound: true,
      preMoneyChange: 0,
      investmentChange: 0,
    });
    expect(resultSelector.shareholders[0].ownershipPct.toFixed(2)).toEqual(
      "24.13",
    );
    expect(resultSelector.shareholders[0].ownershipChange).toEqual(0);
  });
  test("Changing investment amounts", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const resultSelector = getPriceRoundPropsSelector({
      ...store.getState(),
      hasNewRound: true,
      preMoneyChange: 0,
      investmentChange: 500_000,
    });
    expect(resultSelector.shareholders[0].ownershipPct.toFixed(2)).toEqual(
      "23.28",
    );
    expect(resultSelector.totalShares).toEqual(12_886_615);
    // Ensure the pricedConversion matches the expected shares from the entire cap table
    expect(resultSelector.totalShares).toEqual(
      resultSelector.shareholders.reduce(
        (acc, val) => acc + (val.shares ?? 0),
        0,
      ) + resultSelector.pricedConversion.additionalOptions,
    );
    expect(resultSelector.shareholders[0].ownershipChange.toFixed(2)).toEqual(
      "-0.85",
    );
  });
  test("Ensure percentages total to 100%", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const resultSelector = getPriceRoundPropsSelector({
      ...store.getState(),
      hasNewRound: true,
      preMoneyChange: 0,
      investmentChange: 500_000,
      targetOptionsPool: 0,
    });
    expect(resultSelector.totalPct).toEqual(100);
  });
});
