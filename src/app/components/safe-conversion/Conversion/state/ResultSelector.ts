import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { BestFit } from "@/library/safe_conversion";
import { getSAFERowPropsSelector, SAFEProps } from "./SAFESelector";
import { getSeriesPropsSelector, SeriesProps } from "./SeriesSelector";
import { ExistingShareholderProps, getExistingShareholderPropsSelector } from "./ExistingShareholderSelector";

export type ResultSelectorState = IConversionStateData & {
    preMoneyChange: number;
    investmentChange: number;
}

export interface ResultProps {
    preMoney: number;
    postMoney: number;
    existingShareholders: ExistingShareholderProps[];
    safeInvestors: SAFEProps[];
    seriesInvestors: SeriesProps[]
    totalSeriesInvestment: number;
    totalShares: number;
    totalPct: number;
    totalInvestedToDate: number;
    pricedConversion: BestFit;
}

// The goal is to build a result set for a priced round that allows the user to play around
// with pre-money and investment changes to see how it affects the cap table
export const getResultsPropsSelector = createSelector(
    (state: ResultSelectorState) => state.preMoneyChange,
    (state: ResultSelectorState) => state.investmentChange,
    (state: ResultSelectorState) => state.rowData,
    (state: ResultSelectorState) => state.preMoney,
    (state: ResultSelectorState) => state.targetOptionsPool,
    (state: ResultSelectorState) => state.unusedOptions,
    (preMoneyChange, investmentChange, rowData, preMoney, targetOptionsPool, unusedOptions): ResultProps => {
        // Get the Series Investments and distribute the investmentChange over the series investors pro rata
        const initialSeriesInvestment = rowData.filter((row) => row.type === "series").map((row) => row.investment).reduce((acc, val) => acc + val, 0);
        const seriesInvestmentChanges = rowData.map((row) => {
            if (row.type === "series") {
                return investmentChange * (row.investment / initialSeriesInvestment);
            }
            return 0
        })
        const totalSeriesInvestment = initialSeriesInvestment + investmentChange;
        const newPreMoney = preMoney + preMoneyChange - investmentChange;

        const updatedRows = rowData.map((row, idx) => {
            if (row.type === "series") {
                return {
                    ...row,
                    investment: row.investment + seriesInvestmentChanges[idx]
                }
            }
            return row
        })


        const trialState: IConversionStateData = {
            preMoney: newPreMoney,
            targetOptionsPool,
            unusedOptions,
            rowData: updatedRows,
            hasNewRound: true,
        };

        const pricedConversion = getPricedConversion(trialState)!

        const existingShareholders = getExistingShareholderPropsSelector(trialState);
        const safeInvestors = getSAFERowPropsSelector(trialState);
        const seriesInvestors = getSeriesPropsSelector(trialState);

        // Double check the math
        const totalShares = existingShareholders.map((shareholder) => shareholder.shares).reduce((acc, val) => acc + val, 0) +
            safeInvestors.map((investor) => investor.shares ?? 0).reduce((acc, val) => acc + val, 0) +
            seriesInvestors.map((investor) => investor.shares).reduce((acc, val) => acc + val, 0) +
            (pricedConversion?.totalOptions ?? 0);

        const totalPct = Math.round(existingShareholders.map((shareholder) => shareholder.dilutedPct).reduce((acc, val) => acc + val, 0) +
            safeInvestors.map((investor) => investor.ownershipPct).reduce((acc, val) => acc + val, 0) +
            seriesInvestors.map((investor) => investor.ownershipPct).reduce((acc, val) => acc + val, 0) + targetOptionsPool)

        const totalInvestedToDate = trialState.rowData.filter((row) => row.type === "safe").map((row) => row.investment).reduce((acc, val) => acc + val, 0) +
            trialState.rowData.filter((row) => row.type === "series").map((row) => row.investment).reduce((acc, val) => acc + val, 0);

        return {
            preMoney: newPreMoney,
            postMoney: newPreMoney + totalSeriesInvestment,
            existingShareholders,
            safeInvestors,
            seriesInvestors,
            totalShares,
            totalPct,
            totalInvestedToDate,
            totalSeriesInvestment,
            pricedConversion,
        }

    },
);