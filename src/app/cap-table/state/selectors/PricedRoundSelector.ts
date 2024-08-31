import { createSelector } from "reselect";
import { ExistingShareholderState, IConversionStateData, IRowState, SAFEState } from "../ConversionState";
import { buildPricedRoundCapTable, CommonStockholder, SAFENote, SeriesInvestor } from "@library/cap-table";
import { CapTableProps } from "@/components/safe-conversion/Conversion/CapTableResults";
import { BestFit, fitConversion } from "@library/conversion-solver";
import { stringToNumber } from "@/utils/numberFormatting";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";
import { getCapForSafe } from "@library/safe-calcs";
import { SeriesProps } from "@/components/safe-conversion/Conversion/SeriesInvestorList";
import { PricedRoundPropsData } from "@/components/safe-conversion/Conversion/PricedRound";

export type ResultSelectorState = IConversionStateData & {
  preMoneyChange?: number;
  investmentChange?: number;
  targetOptionsChange?: number;
};

const rowDataToStakeholders = (rowData: IRowState[]): (CommonStockholder | SAFENote | SeriesInvestor)[] => {

    const commonStock: CommonStockholder[] = (rowData.filter((row) => row.type === "common") as ExistingShareholderState[]).map(
      (row) => {
        return {
          name: row.name ?? "",
          shares: row.shares,
          type: 'common',
          commonType: 'shareholder',
        }
      }
    );

    const safeNotes: SAFENote[] = (rowData.filter((row) => row.type === "safe") as SAFEState[]).map(
      (row) => {
        const conversionType = row.conversionType === "mfn" ? "post" : row.conversionType === 'post' ? "post" : "pre";
        return {
          name: row.name ?? "",
          investment: row.investment,
          cap: row.cap ?? 0,
          discount: row.discount ?? 0,
          conversionType,
          sideLetters: row.conversionType === "mfn" ? ["mfn"] : [],
          type: 'safe',
        }
      }
    );

    const seriesInvestors: SeriesInvestor[] = rowData.filter((row) => row.type === "series").map(
      (row) => {
        return {
          name: row.name ?? "",
          investment: row.investment,
          type: 'series',
          round: 1,
        }
      }
    );
    return [...commonStock, ...safeNotes, ...seriesInvestors];
}

const getPricedConversion = createSelector(
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.preMoney,
  (state: IConversionStateData) => state.targetOptionsPool,
  (state: IConversionStateData) => state.unusedOptions,
  (
    rowData,
    preMoney,
    targetOptionsPool,
    unusedOptions,
  ): BestFit => {
    const commonStock = (
      rowData.filter(
        (row) => row.type === "common",
      ) as ExistingShareholderState[]
    )
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const totalShares = commonStock;
    const safeInvestors = rowData.filter((row) => row.type === "safe") as SAFEProps[];
    const pricedConversion = fitConversion(
      stringToNumber(preMoney),
      totalShares,
      (safeInvestors).map(
        (row, idx) => {
          // Handles MFN and YC MFN safes, finds the best cap
          const calculatedCap = getCapForSafe(idx, safeInvestors);
          // We have numerous conversion types, but we need to boil it down to pre or post
          // The YC7P and YCMFN are both post-money safes
          // Just set the conversion type to post if it's not pre
          const conversionType = row.conversionType === "pre" ? "pre" : "post"
          return {
            investment: stringToNumber(row.investment),
            cap: calculatedCap,
            discount: stringToNumber(row.discount ?? 0) / 100,
            conversionType,
            type: "safe",
          };
        },
      ),
      stringToNumber(unusedOptions),
      stringToNumber(targetOptionsPool) / 100,
      (rowData.filter((row) => row.type === "series") as SeriesProps[]).map(
        (row) => row.investment,
      ),
      { roundShares: true, roundPPSPlaces: 8 },
    );
    return pricedConversion;
  },
);

// If we have trial changes, we need to calculate the cap table with the trial changes and return both before and after
export const getPricedRoundData = createSelector(
  getPricedConversion,
  (state: ResultSelectorState) => state.rowData,
  (state: ResultSelectorState) => state.preMoney,
  (state: ResultSelectorState) => state.unusedOptions,
  (state: ResultSelectorState) => state.targetOptionsPool,
  (state: ResultSelectorState) => state.preMoneyChange,
  (state: ResultSelectorState) => state.investmentChange,
  (state: ResultSelectorState) => state.targetOptionsChange,
  (
    pricedConversion,
    rowData,
    preMoney,
    unusedOptions,
    targetOptionsPool,
    preMoneyChange,
    investmentChange,
    targetOptionsChange,
    ): {currentPricedRound: BestFit, previousPricedRound?: BestFit, rowData: IRowState[]} => {

      investmentChange = investmentChange ?? 0;
      preMoneyChange = preMoneyChange ?? 0;
      targetOptionsChange = targetOptionsChange ?? 0;

    let trialPricedConversion: BestFit | null = null


    let updatedRows = rowData;
    if (investmentChange !== 0 || preMoneyChange !== 0 || targetOptionsChange !== 0) {

      // Get the Series Investments and distribute the investmentChange over the series investors pro rata
      const initialSeriesInvestment = rowData
        .filter((row) => row.type === "series")
        .map((row) => row.investment)
        .reduce((acc, val) => acc + val, 0);

      // Pro rata the investment change over the series investors
      const seriesInvestmentChanges = rowData.map((row) => {
        if (row.type === "series") {
          return investmentChange * (row.investment / initialSeriesInvestment);
        }
        return 0;
      });

      // Update the series investments with the above pro rata changes
      updatedRows = rowData.map((row, idx) => {
        if (row.type === "series") {
          return {
            ...row,
            investment: row.investment + seriesInvestmentChanges[idx],
          };
        }
        return row;
      });


      const currentPreMoney = preMoney + preMoneyChange;


      // With the changes
      const currentState: IConversionStateData = {
        preMoney: currentPreMoney,
        targetOptionsPool: targetOptionsPool + (targetOptionsChange * 100),
        unusedOptions,
        rowData: updatedRows,
      };

      trialPricedConversion = getPricedConversion(currentState);

    }

    return {
      currentPricedRound: trialPricedConversion ?? pricedConversion,
      previousPricedRound: trialPricedConversion ? pricedConversion : undefined,
      rowData: updatedRows,
    }
});

// Priced round cap table
export const getPricedRoundCapTableSelector = createSelector(
  getPricedRoundData,
  (state: ResultSelectorState) => state.rowData,
  (
    pricedRoundData,
    rowData
    ): CapTableProps => {
    const updatedRowData = pricedRoundData.rowData;

    const currentRows = rowDataToStakeholders(updatedRowData);
    const previousRows = rowDataToStakeholders(rowData);

    const pricedRoundResults = buildPricedRoundCapTable(pricedRoundData.currentPricedRound, currentRows);
    const previousPricedRoundResults = pricedRoundData.previousPricedRound ? buildPricedRoundCapTable(pricedRoundData.previousPricedRound, previousRows) : null;
    const {common, safes, series, refreshedOptionsPool, total} = pricedRoundResults;
    const capTableRows = [...common, ...safes, ...series, refreshedOptionsPool];

    const ownershipChanges: number[] = [];
    if (previousPricedRoundResults) {
      const previousCapTableRows = [...previousPricedRoundResults.common, ...previousPricedRoundResults.safes, ...previousPricedRoundResults.series, previousPricedRoundResults.refreshedOptionsPool]
      // Calculate the ownership change for each row
      previousCapTableRows.map((row, idx) => {
        ownershipChanges.push((capTableRows[idx].ownershipPct ?? 0) - (row.ownershipPct ?? 0));
      })

    }


    return {
      totalRow: total,
      changes: [],
      rows: capTableRows.map((row) => {
        if (row.type === 'safe') {
          return {
            name: row.name ?? "",
            shares: row.shares,
            investment: row.investment,
            pps: row.pps,
            cap: row.cap,
            discount: row.discount,
            type: row.type,
            ownershipPct: (row.ownershipPct ?? 0) * 100,
          }
        }
        if (row.type === 'series') {
          const pps = row.pps
          const investment = row.investment
          return {
            name: row.name ?? "",
            shares: row.shares,
            investment,
            pps,
            type: row.type,
            ownershipPct: (row.ownershipPct ?? 0) * 100,
          }
        }
        return {
            name: row.name ?? "",
            shares: row.shares,
            type: row.type,
            ownershipPct: (row.ownershipPct ?? 0) * 100,
        }
      })
    }
  },
);

// Priced overview
export const getPricedRoundOverviewSelector = createSelector(
  getPricedRoundData,
  (state: ResultSelectorState) => state.preMoney,
  (state: ResultSelectorState) => state.preMoneyChange,
  (state: ResultSelectorState) => state.investmentChange,
  (state: ResultSelectorState) => state.targetOptionsChange,
  (
    pricedRoundData,
    preMoney,
    preMoneyChange,
    investmentChange,
    targetOptionsChange,
    ): PricedRoundPropsData => {

    const currentPricedConversion = pricedRoundData.currentPricedRound;
    const previousPricedConversion = pricedRoundData.previousPricedRound;

    // Keep track of the changes before and after to calculate the effect on the cap table
    const currentPreMoney = preMoney + (preMoneyChange ?? 0);
    const previousPreMoney = preMoney;

    const current = {
        preMoney: currentPreMoney,
        postMoney: currentPreMoney + currentPricedConversion.totalInvested,
        totalShares: currentPricedConversion.totalShares,
        newSharesIssued: currentPricedConversion.newSharesIssued,
        totalInvestedToDate: currentPricedConversion.totalInvested,
        totalSeriesInvestment: currentPricedConversion.totalSeriesInvestment,
        totalRoundDilution: (currentPricedConversion.newSharesIssued / currentPricedConversion.totalShares) * 100, 
        pricedConversion: currentPricedConversion,
    }

    const previous = previousPricedConversion ? {
        preMoney,
        postMoney: previousPreMoney + previousPricedConversion.totalInvested,
        totalShares: previousPricedConversion.totalShares,
        newSharesIssued: previousPricedConversion.newSharesIssued,
        totalInvestedToDate: previousPricedConversion.totalInvested,
        totalSeriesInvestment: previousPricedConversion.totalSeriesInvestment,
        totalRoundDilution: (previousPricedConversion.newSharesIssued / previousPricedConversion.totalShares) * 100, 
        pricedConversion: previousPricedConversion,
    } : undefined;

    return {
      current,
      previous: previous || current,
      preMoneyChange: preMoneyChange ?? 0,
      investmentChange: investmentChange ?? 0,
      targetOptionsChange: targetOptionsChange ?? 0,
    };
  },
);