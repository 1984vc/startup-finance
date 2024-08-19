import { BestFit } from "@library/safe_conversion";
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
      if (row.conversionType === "mfn" || row.conversionType === "ycmfn") {
        return val;
      }

      // Ignore Pre-money safes for now. The assumption is that the MFN is Post-money (YC's is)
      if (row.conversionType === "pre") {
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
  if (safe.conversionType === "mfn" || safe.conversionType === "ycmfn") {
    return getMFNCapAter(safes, idx);
  }
  return safe.cap;
};


// Calculate the ownership percentages for each safe, pre and post conversion
export const calcSAFEs = (
  rowData: IRowState[],
  pricedConversion: BestFit,
): [pct: number, cap: number, shares: number, pps: number][][] => {
  const rows = rowData.filter((row) => row.type === "safe");

  const safeCaps = rows.map((safe) => {
    return getCapForSafe(safe, rows);
  });

  // Calculate the ownership percentages for each safe
  // Both pre and post conversion
  return rows.map((data, idx) => {
    const cap = safeCaps[idx];
    const rowCalcs: [number, number, number, number][] = []
    const discountedConversionPPS = pricedConversion.pps * (1 - data.discount);

    let safePPS = discountedConversionPPS

    if (cap > 0) {
      safePPS = Math.min(
        discountedConversionPPS,
        data.conversionType === 'pre' ?
          // Pre-money conversion is based on pre-money shares
          cap / pricedConversion.preMoneyShares :
          cap / pricedConversion.postMoneyShares
      );
    }

    const safeShares = Math.floor(data.investment / safePPS);
    
    rowCalcs.push([
      (safeShares / pricedConversion.postMoneyShares) * 100,
      cap,
      0,
      safePPS
    ]);

    const pps = pricedConversion.ppss[idx];
    const shares = Math.floor(data.investment / pps);
    rowCalcs.push([
      (shares / pricedConversion.totalShares) * 100,
      cap,
      shares,
      pps
    ]);

    return rowCalcs;
  });
};
