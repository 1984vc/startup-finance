import { describe, expect, test } from "@jest/globals";
import {
  createConversionStore,
  IConversionStateData,
} from "@/cap-table/state/ConversionState";
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
    expect(resultSelector.current.totalShares).toEqual(resultSelector.previous.totalShares);
  });
  test("Changing investment amounts", () => {
    const store = createConversionStore(fixtureData as IConversionStateData);
    const resultSelector = getPriceRoundPropsSelector({
      ...store.getState(),
      hasNewRound: true,
      preMoneyChange: 0,
      investmentChange: 500_000,
    });
    expect(resultSelector.current.totalShares).toEqual(12_776_528);
    // Ensure the pricedConversion matches the expected shares from the entire cap table
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
    expect(resultSelector.current.totalPct).toEqual(100);
  });
});
