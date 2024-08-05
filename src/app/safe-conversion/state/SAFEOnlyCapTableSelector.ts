import { createSelector } from "reselect";
import {
  ExistingShareholderState,
  IConversionStateData,
} from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import { ShareholderRow } from "@/app/components/safe-conversion/Conversion/PricedRound";
import { CapTableResultProps } from "@/app/components/safe-conversion/Conversion/CapTableResults";
import { ExistingShareholderProps } from "@/app/components/safe-conversion/Conversion/ExistingShareholders";

// Get a cap table with a guess at the conversion at the SAFE Cap. This is helpful to understand
// the estimated ownership breakdown before a priced round.
export const getSAFEOnlyCapTableSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  (existingShareholders, safeInvestors): CapTableResultProps => {
    const totalInvestedToDate = safeInvestors
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const shareholders: ShareholderRow[] = [];

    const totalShares = existingShareholders.reduce(
      (acc, val) => acc + (val.shares ?? 0),
      0,
    );

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
