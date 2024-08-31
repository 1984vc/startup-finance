import { describe, expect, test } from "@jest/globals";
import { buildPreRoundCapTable, buildPricedRoundCapTable, CapTableRow, CommonStockholder, SAFENote, SeriesInvestor, TotalCapTableRow } from "@library/cap-table";
import { DEFAULT_ROUNDING_STRATEGY, fitConversion } from "@library/conversion-solver";
import { roundPPSToPlaces } from "@library/utils/rounding";

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

const crossCheckCapTableResults = (rows: CapTableRow[], total: TotalCapTableRow) => {
  const investors = rows.filter(row => ['safe','series'].includes(row.type)) as (SAFENote | SeriesInvestor)[];
  const investedTotal = investors.reduce((acc, row) => acc + (row.investment ?? 0), 0);
  expect(investedTotal).toEqual(total.investment);

  // Handle floating point issues, 12 places of precision is plenty close
  const pctTotal = roundPPSToPlaces(rows.reduce((acc, row) => acc + (row.ownershipPct ?? 0), 0), 12);
  expect(pctTotal).toEqual(1);
  expect(total.ownershipPct).toEqual(1);

  const totalShares = rows.reduce((acc, row) => acc + (row.shares ?? 0), 0);
  expect(totalShares).toEqual(total.shares);
}

describe("Building a pre-round cap table with common shareholders and SAFE notes", () => {
  test("Sanity check our baseline", () => {
    const {common, safes, total} = buildPreRoundCapTable([...commonFixture, ...safeFixture]);
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
    const {common, safes, total} = buildPreRoundCapTable([...commonFixture, ...safeFixtureMod]);
    crossCheckCapTableResults([...common, ...safes], total);

    expect(common.length).toEqual(4);

    expect(safes[2].cap).toEqual(8_000_000);

  });

  test("Handle pre-round with pre-money conversion", () => {
    const safeFixtureMod: SAFENote[] = [...safeFixture]
    safeFixtureMod.push(
      {
        name: "Pre Investor 1",
        investment: 1_000_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "pre",
        type: "safe",
      },
    )
    const {common, safes, total} = buildPreRoundCapTable([...commonFixture, ...safeFixtureMod]);
    crossCheckCapTableResults([...common, ...safes], total);

    // Pre-money conversion assumes the cap is pre-money, so the ownership percentage is (investment / (cap + totalSafeInvestment))
    expect(safes[2].type === 'safe' && safes[2].ownershipPct).toEqual(1_000_000/(10_000_000 + 3_000_000));

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