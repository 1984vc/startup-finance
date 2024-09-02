import { describe, expect, test } from "@jest/globals";
import { buildEstimatedPreRoundCapTable, buildPreRoundCapTable, CommonStockholder, SAFENote, SeriesInvestor } from "@library/cap-table";
import { crossCheckCapTableResults } from "./utils";
import { fitConversion, DEFAULT_ROUNDING_STRATEGY } from "@library/conversion-solver";

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

const safeFixtureWithPreMoney: SAFENote[] = [
  ...safeFixture,
  {
    name: "Pre Investor 1",
    investment: 1_000_000,
    discount: 0,
    cap: 10_000_000,
    conversionType: "pre",
    type: "safe",
  },
]

describe("Building an estimated pre-round cap table with common shareholders and SAFE notes", () => {
  test("Sanity check our baseline", () => {
    const {common, safes, total} = buildEstimatedPreRoundCapTable([...commonFixture, ...safeFixture]);
    expect(common.length).toEqual(4);
    expect(safes.length).toEqual(2);
    crossCheckCapTableResults([...common, ...safes], total);
  });
  test("Handle pre-round with MFN", () => {
    const safeFixtureMod: SAFENote[] = [...safeFixture]
    safeFixtureMod.push(
      {
        name: "MFN Investor",
        investment: 1_000_000,
        discount: 0,
        cap: 0,
        conversionType: "post",
        sideLetters: ["mfn"],
        type: "safe",
      },
      {
        name: "Another Investor 1",
        investment: 1_000_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
        type: "safe",
      },
      {
        name: "Another Investor 2",
        investment: 1_000_000,
        discount: 0,
        cap: 8_000_000,
        conversionType: "post",
        type: "safe",
      },
    )
    const {common, safes, total} = buildEstimatedPreRoundCapTable([...commonFixture, ...safeFixtureMod]);
    crossCheckCapTableResults([...common, ...safes], total);

    expect(common.length).toEqual(4);

    // Ensure MFN cap is correct
    expect(safes[2].cap).toEqual(8_000_000);

  });

  test("Handle pre-round with pre-money conversion", () => {
    const {common, safes, total} = buildEstimatedPreRoundCapTable([...commonFixture, ...safeFixtureWithPreMoney]);
    crossCheckCapTableResults([...common, ...safes], total);

    // We use a "fake" priced round with no additional options to estimate the pre-money conversion
    // As long as the priced-round is at a valuation higher than the cap, this will be an accurate pre-money value
    expect(safes[2].type === 'safe' && safes[2].ownershipPct?.toFixed(5)).toEqual("0.07727");

  });
});

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

describe("Building a priced-round pre-round cap table with common shareholders, SAFE notes", () => {
  // This is different than the priced-round cap table because it's the cap table excluding the new series investors and additional options refresh
  test("Pre-round cap table with pre-money SAFE should be the same as the estimate", () => {
    const premoney = 25_000_000;
    const commonShares = commonFixture.filter(row => row.type === "common" && row.commonType === 'shareholder').reduce((acc, row) => acc + row.shares, 0);
    const unusedOptions = commonFixture.filter(row => row.type === "common" && row.commonType === 'unusedOptions').reduce((acc, row) => acc + row.shares, 0);

    const pricedConversion = fitConversion(premoney, commonShares, safeFixtureWithPreMoney, unusedOptions, 0.0, [
      seriesFixture[0].investment,
      seriesFixture[1].investment,
    ], DEFAULT_ROUNDING_STRATEGY);
    const {common, safes, total} = buildPreRoundCapTable(pricedConversion, [...commonFixture, ...safeFixtureWithPreMoney]);
    expect(common.length).toEqual(4); // We include un-used options for this interim pre-round cap table.
    expect(safes.length).toEqual(3);
    
    crossCheckCapTableResults([...common, ...safes], total);

    // Should match our ownership pct from the estimated round because we didn't add additional options
    expect(safes[2].type === 'safe' && safes[2].ownershipPct?.toFixed(8)).toEqual("0.07727277");
  });
});
