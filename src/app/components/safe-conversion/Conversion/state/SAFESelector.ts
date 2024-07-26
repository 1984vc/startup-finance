import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData, IRowState, SAFEState } from "./ConversionState";
import { calcSAFEs } from "@/app/utils/rowDataHelper";
import { BestFit } from "@/library/safe_conversion";

export interface SAFEProps extends SAFEState {
    ownershipPct: number;
    ownershipError?: string;
    allowDelete?: boolean;
    shares?: number;
    disabledFields?: string[];
}

const determineRowError = (row: IRowState, pricedConversion: BestFit | undefined): string | undefined => {
    if (row.type === "safe") {
        const safe = row as SAFEProps;
        if (safe.cap === 0) {
            if (pricedConversion) {
              return undefined
            }
            // Unless with have priced round, we can't calculate an uncapped SAFE
            return "TBD"
        }
        else if (safe.cap < safe.investment) {
            // We shouldn't allow for this, as it makes no sense
            return "Error"
        }
    }
    return undefined
}


export const getSAFERowPropsSelector = createSelector(
    getPricedConversion,
    (state: IConversionStateData) => state.rowData,
    (pricedConversion, rowData): SAFEProps[] => {
        const rows = rowData.filter((row) => row.type === "safe");

        const safeCalcs = calcSAFEs(rows, pricedConversion);

        return rows.map((row, idx) => {
            const rowResult: SAFEProps = {
                id: row.id,
                type: "safe",
                name: row.name,
                investment: row.investment,
                cap: safeCalcs[idx][1],
                discount: row.discount,
                ownershipPct: safeCalcs[idx][0],
                shares: safeCalcs[idx][2],
                allowDelete: rows.length > 1,
                disabledFields: row.conversionType === 'mfn' ? ['cap'] : [],
                conversionType: row.conversionType,
            };
            const ownershipError = determineRowError(rowResult, pricedConversion);
            return {
              ...rowResult,
              ownershipError,
            }
        });
    },
);