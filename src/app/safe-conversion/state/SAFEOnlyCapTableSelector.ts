import { createSelector } from "reselect";
import { ExistingShareholderState, IConversionStateData } from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import { ShareholderRow } from "@/app/components/safe-conversion/Conversion/PricedRound";
import { CapTableResultProps } from "@/app/components/safe-conversion/Conversion/CapTableResults";
import { ExistingShareholderProps } from "@/app/components/safe-conversion/Conversion/ExistingShareholders";

// The goal is to build a result set for a priced round that allows the user to play around
// with pre-money and investment changes to see how it affects the cap table
export const getSAFEOnlyCapTableSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.unusedOptions,
  (existingShareholders, safeInvestors, rowData, unusedOptions): CapTableResultProps => {
    const totalInvestedToDate = safeInvestors
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const shareholders: ShareholderRow[] = [];

    const totalShares = existingShareholders.reduce((acc, val) => acc + (val.shares ?? 0), 0) + unusedOptions;

    // For this view, place the unused options in a common row

    const currentShareholders = [...existingShareholders, ...safeInvestors];
    currentShareholders.forEach((shareholder, idx) => {
      if (shareholder.type === "common") {
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          ownershipPct: shareholder.dilutedPct,
          ownershipChange: 0,
        });
      } else if (shareholder.type === "safe") {
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          investment: shareholder.investment,
          ownershipPct: shareholder.ownershipPct,
          ownershipChange: 0,
          ownershipError: shareholder.ownershipError,
        });
      }
    });

    const totalPct = shareholders.reduce(
      (acc, val) => acc + val.ownershipPct,
      0,
    );

    return {
      totalPct,
      totalInvestedToDate,
      shareholders,
      totalShares,
    };
  },
);
