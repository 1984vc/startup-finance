import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getSeriesPropsSelector } from "./SeriesSelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import { ExistingShareholderProps } from "@/app/components/safe-conversion/Conversion/ExistingShareholders";
import { SAFEProps } from "@/app/components/safe-conversion/Conversion/SafeNoteList";
import { SeriesProps } from "@/app/components/safe-conversion/Conversion/SeriesInvestorList";
import {
  PricedRoundPropsData,
  ShareholderRow,
} from "@/app/components/safe-conversion/Conversion/PricedRound";


export type ResultSelectorState = IConversionStateData & {
  preMoneyChange?: number;
  investmentChange?: number;
};

// The goal is to build a result set for a priced round that allows the user to play around
// with pre-money and investment changes to see how it affects the cap table
export const getPriceRoundPropsSelector = createSelector(
  getExistingShareholderPropsSelector,
  getSAFERowPropsSelector,
  getSeriesPropsSelector,
  (state: ResultSelectorState) => state.preMoneyChange,
  (state: ResultSelectorState) => state.investmentChange,
  (state: ResultSelectorState) => state.rowData,
  (state: ResultSelectorState) => state.preMoney,
  (state: ResultSelectorState) => state.targetOptionsPool,
  (state: ResultSelectorState) => state.unusedOptions,
  (state: ResultSelectorState) => state.hasNewRound,
  (
    existingShareholders,
    safeInvestors,
    seriesInvestors,
    preMoneyChange,
    investmentChange,
    rowData,
    preMoney,
    targetOptionsPool,
    unusedOptions,
    hasNewRound
): PricedRoundPropsData => {
    investmentChange = investmentChange ?? 0;
    preMoneyChange = preMoneyChange ?? 0;
    // Get the Series Investments and distribute the investmentChange over the series investors pro rata
    const initialSeriesInvestment = rowData
      .filter((row) => row.type === "series")
      .map((row) => row.investment)
      .reduce((acc, val) => acc + val, 0);
    const seriesInvestmentChanges = rowData.map((row) => {
      if (row.type === "series") {
        return investmentChange * (row.investment / initialSeriesInvestment);
      }
      return 0;
    });
    const totalSeriesInvestment = initialSeriesInvestment + investmentChange;
    const newPreMoney = preMoney + preMoneyChange - investmentChange;

    const updatedRows = rowData.map((row, idx) => {
      if (row.type === "series") {
        return {
          ...row,
          investment: row.investment + seriesInvestmentChanges[idx],
        };
      }
      return row;
    });

    const trialState: IConversionStateData = {
      preMoney: newPreMoney,
      targetOptionsPool,
      unusedOptions,
      rowData: updatedRows,
      hasNewRound: true,
    };

    const trialPricedConversion = getPricedConversion(trialState)!;

    const shareholders: ShareholderRow[] = [];

    const currentShareholders = [
      ...existingShareholders,
      ...safeInvestors,
      ...seriesInvestors,
    ];
    const trialShareholders = [
      ...getExistingShareholderPropsSelector(trialState),
      ...getSAFERowPropsSelector(trialState),
      ...getSeriesPropsSelector(trialState),
    ];
    trialShareholders.forEach((shareholder, idx) => {
      if (shareholder.type === "common") {
        const currentShareholder = currentShareholders[
          idx
        ] as ExistingShareholderProps;
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          ownershipPct: shareholder.dilutedPct,
          ownershipChange:
            shareholder.dilutedPct - currentShareholder.dilutedPct,
        });
      } else if (shareholder.type === "safe") {
        const currentShareholder = currentShareholders[idx] as SAFEProps;
        shareholders.push({
          name: shareholder.name,
          shares: shareholder.shares,
          investment: shareholder.investment,
          ownershipPct: shareholder.ownershipPct,
          ownershipChange:
            shareholder.ownershipPct - currentShareholder.ownershipPct,
        });
      } else if (shareholder.type === "series") {
        if (hasNewRound) {
          const currentShareholder = currentShareholders[idx] as SeriesProps;
          shareholders.push({
            name: shareholder.name,
            shares: shareholder.shares,
            investment: shareholder.investment,
            ownershipPct: shareholder.ownershipPct,
            ownershipChange:
              shareholder.ownershipPct - currentShareholder.ownershipPct,
          });
        }
      }
    });

    const unusedOptionsPct = (trialPricedConversion.totalOptions / trialPricedConversion.totalShares) * 100;

    const totalPct = Math.round(
      shareholders
        .map((shareholder) => shareholder.ownershipPct)
        .reduce((acc, val) => acc + val, 0) + unusedOptionsPct,
    );

    const totalInvestedToDate =
      trialState.rowData
        .filter((row) => row.type === "safe")
        .map((row) => row.investment)
        .reduce((acc, val) => acc + val, 0) +
      trialState.rowData
        .filter((row) => row.type === "series")
        .map((row) => row.investment)
        .reduce((acc, val) => acc + val, 0);

    return {
      preMoneyChange,
      investmentChange,
      preMoney: newPreMoney,
      postMoney: newPreMoney + totalSeriesInvestment,
      totalShares: trialPricedConversion.totalShares,
      totalPct,
      totalInvestedToDate,
      totalSeriesInvestment,
      pricedConversion: trialPricedConversion,
      shareholders,
    };
  },
);
