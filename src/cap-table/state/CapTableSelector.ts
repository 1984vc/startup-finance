import { createSelector } from "reselect";
import { IConversionStateData } from "./ConversionState";
import {
  CapTableProps,
} from "@/components/safe-conversion/Conversion/CapTableResults";
import { getPriceRoundPropsSelector } from "./PricedRoundSelector";
import { BestFit } from "@/library/safe_conversion";
import { CapTableRow } from "@/components/safe-conversion/Conversion/PricedRound";

export type ResultSelectorState = IConversionStateData & {
  preMoneyChange?: number;
  investmentChange?: number;
};

const optionsPoolRefreshRow = (current: BestFit, previous: BestFit): CapTableRow => {
  const currentOwnershipPct= (current.totalOptions / current.totalShares) * 100
  const previousOwnershipPct= (previous.totalOptions / previous.totalShares) * 100
  return {
    name: "Options Pool Refresh",
    shares: current.totalOptions,
    ownershipPct: currentOwnershipPct,
    ownershipChange: currentOwnershipPct - previousOwnershipPct,
  }
}

// Simply output what is required for the cap table
export const getCapTablePropsSelector = createSelector(
  getPriceRoundPropsSelector,
  (
    pricedRoundData,
  ): CapTableProps => {
    return {
      totalPct: pricedRoundData.current.totalPct,
      totalInvestedToDate: pricedRoundData.current.totalInvestedToDate,
      totalShares: pricedRoundData.current.totalShares,
      capTable: [...
        pricedRoundData.capTable,
        optionsPoolRefreshRow(pricedRoundData.current.pricedConversion, pricedRoundData.previous.pricedConversion),
      ],
    };
  },
);
