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
    const {rows, total} = buildPreRoundCapTable([...commonFixture, ...safeFixture]);
    expect(rows.length).toEqual(6);

    const investedTotal = rows.reduce((acc, row) => acc + (row.investment ?? 0), 0);
    expect(investedTotal).toEqual(total.investment);

    const pctTotal = rows.reduce((acc, row) => acc + (row.ownershipPct ?? 0), 0);
    expect(pctTotal).toEqual(1);
    expect(total.ownershipPct).toEqual(1);

    const totalShares = rows.reduce((acc, row) => acc + (row.shares ?? 0), 0);
    expect(totalShares).toEqual(total.shares);
    expect(totalShares).toEqual(10_000_000);
    expect(total.shares).toEqual(10_000_000);
  });
  test("Handle pre-round", () => {
    const safes: ISafeNote[] = [...safeFixture]
    safes.push(
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
    const {rows, total} = buildPreRoundCapTable([...commonFixture, ...safes]);
    crossCheckCapTableResults(rows, total);

    expect(rows.length).toEqual(9);
    console.log(rows, total)

    expect(rows[6].cap).toEqual(8_000_000);

  });
});