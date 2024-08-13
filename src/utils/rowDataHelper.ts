import { BestFit } from "@/library/safe_conversion";
import {
  IRowState,
  SAFEState,
} from "@/cap-table/state/ConversionState";

const getMFNCapAter = (rows: SAFEState[], idx: number): number => {
  // For each safe after the idx, find the lowest number that's not 0
  // and return that number
  return (
    rows.slice(idx + 1).reduce((val, row) => {
      // Ignore anything that's in MFN
      if (row.conversionType === "mfn") {
        return val;
      }
      // if the value is 0, return the cap (this is the lowest possible value)
      if (val === 0) {
        return row.cap;
      }
      // If the value is greater than 0 and the cap is greater than 0 and less than the value
      // This is our new MFN
      if (val > 0 && row.cap > 0 && row.cap < val) {
        return row.cap;
      }
      // Just return the current value
      return val;
    }, 0) ?? 0
  );
};

// Do all the complex work here of handling row data and doing some complex calculations
// like MFN on safes and ownership percentages at various stages
const getCapForSafe = (safe: SAFEState, safes: SAFEState[]): number => {
  const idx = safes.findIndex((r) => r.id === safe.id);
  if (safe.conversionType === "mfn") {
    return getMFNCapAter(safes, idx);
  }
  return safe.cap;
};

export const calcSAFEs = (
  rowData: IRowState[],
  pricedConversion?: BestFit,
): [pct: number, cap: number, shares: number][][] => {
  const rows = rowData.filter((row) => row.type === "safe");

  const safeCaps = rows.map((safe) => {
    return getCapForSafe(safe, rows);
  });

  return rows.map((data, idx) => {
    const rowCalcs: [number, number, number][] = []
    rowCalcs.push([
      (data.investment / safeCaps[idx]) * 100,
      safeCaps[idx],
      0,
    ]);
    if (pricedConversion) {
      const pps = pricedConversion.ppss[idx];
      const shares = Math.floor(data.investment / pps);
      rowCalcs.push([
        (shares / pricedConversion.totalShares) * 100,
        safeCaps[idx],
        shares,
      ]);
    }
    return rowCalcs;
  });
};
