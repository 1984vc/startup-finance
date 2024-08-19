import { createSelector } from "reselect";
import { IConversionStateData } from "../ConversionState";
import {
  CapTableProps,
  CapTableRow,
} from "@/components/safe-conversion/Conversion/CapTableResults";
import { getPriceRoundPropsSelector } from "./PricedRoundPropsSelector";
import { BestFit } from "@library/safe_conversion";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderPropsSelector";
import { getSAFERowPropsSelector } from "./SAFEPropsSelector";

export type ResultSelectorState = IConversionStateData & {
  preMoneyChange?: number;
  investmentChange?: number;
};

const optionsPoolRefreshRow = (current: BestFit, previous: BestFit): CapTableRow => {
  const currentOwnershipPct= (current.totalOptions / current.totalShares) * 100
  const previousOwnershipPct= (previous.totalOptions / previous.totalShares) * 100
  return {
    name: "Options Pool Available",
    shares: current.totalOptions,
    pps: 0,
    ownershipPct: currentOwnershipPct,
    ownershipChange: currentOwnershipPct - previousOwnershipPct,
  }
}

// Simply output what is required for the cap table
export const getPricedRoundCapTablePropsSelector = createSelector(
  getPriceRoundPropsSelector,
  getSAFERowPropsSelector,
  (
    pricedRoundData,
    safeInvestors,
  ): CapTableProps => {

    const hasError = safeInvestors.some((row) => row.ownership[0].note?.error === "Error");

    const capTable: CapTableRow[] = []
    
    pricedRoundData.capTable.map((row) => {
      return capTable.push({
        name: row.name,
        shares: row.shares,
        investment: row.investment,
        pps: row.pps,
        ownershipPct: row.ownershipPct,
        ownershipChange: row.ownershipChange,
        error: hasError,
      });
    });

    return {
      totalPct: pricedRoundData.current.totalPct,
      totalInvestedToDate: pricedRoundData.current.totalInvestedToDate,
      totalShares: pricedRoundData.current.totalShares,
      capTable: [...
        capTable,
        optionsPoolRefreshRow(pricedRoundData.current.pricedConversion, pricedRoundData.previous.pricedConversion),
      ],
    };
  },
);

// Simply output what is required for the cap table
export const getSafeCapTablePropsSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  (existingShareholders, safeInvestors): CapTableProps => {
    const totalInvestedToDate = safeInvestors
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const capTable: CapTableRow[] = [];

    const totalShares = existingShareholders.reduce(
      (acc, val) => acc + (val.shares ?? 0),
      0,
    );

    const currentShareholders = [...existingShareholders, ...safeInvestors];
    currentShareholders.forEach((shareholder) => {
      if (shareholder.type === "common") {
        capTable.push({
          name: shareholder.name,
          shares: shareholder.shares,
          ownershipPct: shareholder.ownership[1].percent,
          pps: 0,
          ownershipChange: 0,
        });
      } else if (shareholder.type === "safe") {
        capTable.push({
          name: shareholder.name,
          shares: shareholder.shares,
          investment: shareholder.investment,
          pps: shareholder.ownership[0].pps,
          ownershipPct: shareholder.ownership[0].percent,
          ownershipChange: 0,
          error: shareholder.ownership[0].note?.error === "Error",
        });
      }
    });

    const totalPct = capTable.reduce(
      (acc, val) => acc + val.ownershipPct,
      0,
    );

    return {
      totalInvestedToDate,
      totalPct,
      totalShares,
      capTable: capTable,
    };
  },
);
