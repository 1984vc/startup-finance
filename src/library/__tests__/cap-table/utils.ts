import { expect } from "@jest/globals";
import { CapTableRow, TotalCapTableRow, SafeCapTableRow, SeriesCapTableRow } from "@library/cap-table";
import { roundToPlaces } from "@library/utils/rounding";

export const crossCheckCapTableResults = (rows: CapTableRow[], total: TotalCapTableRow) => {
  const investors = rows.filter(row => (row.type === 'safe' || row.type === 'series')) as (SafeCapTableRow | SeriesCapTableRow)[];
  const investedTotal = investors.reduce((acc, row) => acc + (row.investment ?? 0), 0);
  expect(investedTotal).toEqual(total.investment);

  // Handle PPS rounding issues, 10 places of precision is plenty close
  const pctTotal = roundToPlaces(rows.reduce((acc, row) => acc + (row.ownershipPct ?? 0), 0), 10)
  expect(pctTotal).toEqual(1);
  expect(total.ownershipPct).toEqual(1);

  const totalShares = rows.reduce((acc, row) => acc + (row.shares ?? 0), 0);
  expect(totalShares).toEqual(total.shares);
}