import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { getSeriesPropsSelector } from "./SeriesSelector";
import { getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";
import {
  CapTableRow,
  PricedRoundPropsData,
} from "@/components/safe-conversion/Conversion/PricedRound";
import { ExistingShareholderProps } from "@/components/safe-conversion/Conversion/ExistingShareholders";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";
import { SeriesProps } from "@/components/safe-conversion/Conversion/SeriesInvestorList";


const buildShareholderProps = (
  currentShareholders: (SAFEProps | SeriesProps | ExistingShareholderProps)[], previousShareholders: (SAFEProps | SeriesProps | ExistingShareholderProps)[]) => {
    const capTableRows: CapTableRow[] = [];

    currentShareholders.forEach((shareholder, idx) => {
      if (shareholder.type === "common") {
        const prevShareholder = previousShareholders[
          idx
        ] as ExistingShareholderProps;
        capTableRows.push({
          name: shareholder.name,
          shares: shareholder.shares,
          ownershipPct: shareholder.ownership[2].percent,
          ownershipChange: shareholder.ownership[2].percent - prevShareholder.ownership[2].percent,
        });
      } else if (shareholder.type === "safe") {
        const prevShareholder = previousShareholders[idx] as SAFEProps;
        capTableRows.push({
          name: shareholder.name,
          shares: shareholder.ownership[1].shares,
          investment: shareholder.investment,
          ownershipPct: shareholder.ownership[1].percent,
          ownershipChange: shareholder.ownership[1].percent - prevShareholder.ownership[1].percent,
        });
      } else if (shareholder.type === "series") {
        const prevShareholder = previousShareholders[idx] as SeriesProps;
        capTableRows.push({
          name: shareholder.name,
          shares: shareholder.ownership[0].shares,
          investment: shareholder.investment,
          ownershipPct: shareholder.ownership[0].percent,
          ownershipChange: shareholder.ownership[0].percent - prevShareholder.ownership[0].percent,
        });
      }
    });
    return capTableRows;
}


export type ResultSelectorState = IConversionStateData & {
  preMoneyChange?: number;
  investmentChange?: number;
};

// The goal is to build a result set for a priced round that allows the user to play around
// with pre-money and investment changes to see how it affects the cap table
export const getPriceRoundPropsSelector = createSelector(
  (state: ResultSelectorState) => state.preMoneyChange,
  (state: ResultSelectorState) => state.investmentChange,
  (state: ResultSelectorState) => state.rowData,
  (state: ResultSelectorState) => state.preMoney,
  (state: ResultSelectorState) => state.targetOptionsPool,
  (state: ResultSelectorState) => state.unusedOptions,
  (
    preMoneyChange,
    investmentChange,
    rowData,
    preMoney,
    targetOptionsPool,
    unusedOptions,
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
    const currentTotalInvestment = initialSeriesInvestment + investmentChange;
    const previousTotalInvestment = initialSeriesInvestment;
    const currentPreMoney = preMoney + preMoneyChange;
    const previousPreMoney = preMoney;

    const updatedRows = rowData.map((row, idx) => {
      if (row.type === "series") {
        return {
          ...row,
          investment: row.investment + seriesInvestmentChanges[idx],
        };
      }
      return row;
    });

    const previousState: IConversionStateData = {
      preMoney: preMoney,
      targetOptionsPool,
      unusedOptions,
      rowData,
    };

    const currentState: IConversionStateData = {
      preMoney: currentPreMoney,
      targetOptionsPool,
      unusedOptions,
      rowData: updatedRows,
    };

    const previousPriceConversion = getPricedConversion(previousState)!;
    const currentPricedConversion = getPricedConversion(currentState)!;

    const previousShareholderProps = [
      ...getExistingShareholderPropsSelector(previousState),
      ...getSAFERowPropsSelector(previousState),
      ...getSeriesPropsSelector(previousState),
    ];
    const currentShareholderProps = [
      ...getExistingShareholderPropsSelector(currentState),
      ...getSAFERowPropsSelector(currentState),
      ...getSeriesPropsSelector(currentState),
    ];

    const currentCapTable = buildShareholderProps(currentShareholderProps, previousShareholderProps);

    const additionalOptionsPct =
      (currentPricedConversion.additionalOptions /
        currentPricedConversion.totalShares) *
      100;

    const totalPct = Math.round(
      currentShareholderProps
        .map((shareholder) => {
          if (shareholder.type === 'series') {
            return shareholder.ownership[0].percent
          } else if (shareholder.type === 'safe') {
            return shareholder.ownership[1].percent
          } else if (shareholder.type === 'common') {
            return shareholder.ownership[2].percent
          }
          return 0
        })
        .reduce((acc, val) => acc + val, 0) + additionalOptionsPct,
    );

    const totalInvestedToDate =
      currentState.rowData
        .filter((row) => row.type === "safe")
        .map((row) => row.investment)
        .reduce((acc, val) => acc + val, 0) +
      currentState.rowData
        .filter((row) => row.type === "series")
        .map((row) => row.investment)
        .reduce((acc, val) => acc + val, 0);

    return {
      current: {
        preMoney: currentPreMoney,
        postMoney: currentPreMoney + currentTotalInvestment,
        totalShares: currentPricedConversion.totalShares,
        newSharesIssued: currentPricedConversion.newSharesIssued,
        totalPct,
        totalInvestedToDate,
        totalSeriesInvestment: currentTotalInvestment,
        totalRoundDilution: (currentPricedConversion.newSharesIssued / currentPricedConversion.totalShares) * 100, 
        pricedConversion: currentPricedConversion,
      },
      previous: {
        preMoney,
        postMoney: previousPreMoney + previousTotalInvestment,
        totalShares: previousPriceConversion.totalShares,
        newSharesIssued: previousPriceConversion.newSharesIssued,
        totalPct,
        totalInvestedToDate,
        totalSeriesInvestment: previousTotalInvestment,
        totalRoundDilution: (previousPriceConversion.newSharesIssued / previousPriceConversion.totalShares) * 100, 
        pricedConversion: previousPriceConversion,
      },
      capTable: currentCapTable,
      preMoneyChange,
      investmentChange,
    };
  },
);
