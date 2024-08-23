import { describe, expect, test } from "@jest/globals";
import { buildPreRoundCapTable, CapTableRow, ICommonStockholder, ISafeNote } from "@library/cap-table";

const commonFixture: ICommonStockholder[] = [
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

const safeFixture: ISafeNote[] = [
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

const crossCheckCapTableResults = (rows: CapTableRow[], total: CapTableRow) => {
  const investedTotal = rows.reduce((acc, row) => acc + (row.investment ?? 0), 0);
  expect(investedTotal).toEqual(total.investment);

  const pctTotal = rows.reduce((acc, row) => acc + (row.ownershipPct ?? 0), 0);
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
    const safeFixtureMod: ISafeNote[] = [...safeFixture]
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
    const safeFixtureMod: ISafeNote[] = [...safeFixture]
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