import { BestFit } from "@/library/safe_conversion";
import { SAFERowData } from "../components/safe-conversion/SafeNoteList";
import { IRowState, SAFERowState } from "../components/safe-conversion/ConversionState";


const getMFNCapAter = (rows: SAFERowState[], idx: number): number => {
    // For each safe after the idx, find the lowest number that's not 0
    // and return that number
    return rows.slice(idx + 1).reduce((val, row) => {
        if (val === 0) {
            return row.cap
        }
        if (val > 0 && row.cap < val) {
            return row.cap
        }
        return val
    }, 0) ?? 0
}

// Do all the complex work here of handling row data and doing some complex calculations
// like MFN on safes and ownership percentages at various stages
type SAFECalculation = {
    cap: number
}
export const getCapForSafe = (safe: SAFERowState, safes: SAFERowState[]): number => {
    const idx = safes.findIndex(r => r.id === safe.id)
    if (safe.conversionType === 'mfn') {
        return getMFNCapAter(safes, idx)
    }
    return safe.cap
}

export const calcSAFEPcts = (rowData: IRowState[], pricedConversion?: BestFit): number[] => {

        const rows = rowData.filter((row) => row.type === "safe");

        const safeCaps = rows.map((safe) => {
            return getCapForSafe(safe, rows);
        });

        const safeOwnershipPct = rows.map((data, idx) => {
            if (!pricedConversion) {
                if (data.cap) {
                    return (data.investment / safeCaps[idx]) * 100;
                }
                return 0;
            }
            const pps = pricedConversion.ppss[idx];
            const shares = Math.floor(data.investment / pps);
            return (shares / pricedConversion.totalShares) * 100;
        });
        return safeOwnershipPct
}
