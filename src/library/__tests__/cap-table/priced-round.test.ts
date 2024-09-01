import { describe, expect, test } from "@jest/globals";
import { buildPricedRoundCapTable, CommonStockholder, SAFENote, SeriesInvestor } from "@library/cap-table";
import { DEFAULT_ROUNDING_STRATEGY, fitConversion } from "@library/conversion-solver";
import { crossCheckCapTableResults } from "./utils";

const commonFixture: CommonStockholder[] = [
  {
    shares: 4_500_000,
    commonType: "shareholder",
    name: "Founder 1",
    type: "common",
  },
  {
    shares: 4_500_000,
    commonType: "shareholder",
    name: "Founder 1",
    type: "common",
  },
  {
    shares: 400_000,
    commonType: "shareholder",
    name: "Issued Options",
    type: "common",
  },
  {
    shares: 600_000,
    type: "common",
    name: "Unused options",
    commonType: "unusedOptions",
  },
]

const safeFixture: SAFENote[] = [
  {
    name: "1984",
    investment: 1_000_000,
    discount: 0,
    cap: 10_000_000,
    conversionType: "post",
    type: "safe",
  },
  {
    name: "Venture Fund 2",
    investment: 1_000_000,
    discount: 0,
    cap: 20_000_000,
    conversionType: "post",
    type: "safe",
  },
]

const seriesFixture: SeriesInvestor[] = [
  {
    name: "1984",
    investment: 3_000_000,
    type: "series",
    round: 1,
  },
  {
    name: "Venture Fund 2",
    investment: 1_000_000,
    type: "series",
    round: 1,
  },
]

describe("Building a priced-round cap table with common shareholders, SAFE notes, and priced round investors", () => {
  test("Sanity check our baseline", () => {
    const premoney = 25_000_000;
    const commonShares = commonFixture.filter(row => row.type === "common" && row.commonType === 'shareholder').reduce((acc, row) => acc + row.shares, 0);
    const unusedOptions = commonFixture.filter(row => row.type === "common" && row.commonType === 'unusedOptions').reduce((acc, row) => acc + row.shares, 0);

    const pricedConversion = fitConversion(premoney, commonShares, safeFixture, unusedOptions, 0.1, [
      seriesFixture[0].investment,
      seriesFixture[1].investment,
    ], DEFAULT_ROUNDING_STRATEGY);
    const {common, safes, series, refreshedOptionsPool, total} = buildPricedRoundCapTable(pricedConversion, [...commonFixture, ...safeFixture, ...seriesFixture]);
    expect(common.length).toEqual(3); // We drop unused options from the common stockholders and add it back as Refreshed Options
    expect(safes.length).toEqual(2);
    expect(series.length).toEqual(2);
    
    crossCheckCapTableResults([...common, ...safes, ...series, refreshedOptionsPool], total);
  });
});