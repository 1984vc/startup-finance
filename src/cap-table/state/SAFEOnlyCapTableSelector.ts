import { createSelector } from "reselect";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import { CapTableRow } from "@/components/safe-conversion/Conversion/PricedRound";
import { CapTableProps } from "@/components/safe-conversion/Conversion/CapTableResults";

// Get a cap table with a guess at the conversion at the SAFE Cap. This is helpful to understand
// the estimated ownership breakdown before a priced round.
export const getSAFEOnlyCapTableSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  (existingShareholders, safeInvestors): CapTableProps => {
    const totalInvestedToDate = safeInvestors
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const shareholders: CapTableRow[] = [];

    const totalShares = existingShareholders.reduce(
      (acc, val) => acc + (val.shares ?? 0),
      0,
    );

    const currentShareholders = [...existingShareholders, ...safeInvestors];
    currentShareholders.forEach((shareholder, _idx) => {
      if (shareholder.type === "common") {
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          ownershipPct: shareholder.ownership[1].percent,
          ownershipChange: 0,
        });
      } else if (shareholder.type === "safe") {
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          investment: shareholder.investment,
          ownershipPct: shareholder.ownership[0].percent,
          ownershipChange: 0,
          ownershipError: shareholder.ownership[0].error,
        });
      }
    });

    const totalPct = shareholders.reduce(
      (acc, val) => acc + val.ownershipPct,
      0,
    );

    return {
      totalInvestedToDate,
      totalPct,
      totalShares,
      capTable: shareholders,
    };
  },
);
