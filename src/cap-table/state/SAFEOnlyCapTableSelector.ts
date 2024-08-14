import { createSelector } from "reselect";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import { CapTableRow } from "@/components/safe-conversion/Conversion/PricedRound";
import { CapTableProps } from "@/components/safe-conversion/Conversion/CapTableResults";
import { IConversionStateData } from "./ConversionState";

// Get a cap table with a guess at the conversion at the SAFE Cap. This is helpful to understand
// the estimated ownership breakdown before a priced round.
export const getSAFEOnlyCapTableSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  (state: IConversionStateData) => state.unusedOptions,
  (existingShareholders, safeInvestors, unusedOptions): CapTableProps => {
    const totalInvestedToDate = safeInvestors
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const shareholders: CapTableRow[] = [];

    const totalShares = existingShareholders.reduce(
      (acc, val) => acc + (val.shares ?? 0),
      0,
    );

    const currentShareholders = [...existingShareholders, ...safeInvestors];
    currentShareholders.forEach((shareholder) => {
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

    // Add the unused options pool to the existing shareholders
    // This will be used to calculate the pre-conversion ownership
    shareholders.push({
      name: "Unused Options Pool",
      shares: unusedOptions,
      investment: 0,
      ownershipPct: (unusedOptions / totalShares) * 100,
      ownershipChange: 0,
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
