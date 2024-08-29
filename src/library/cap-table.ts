// These are all the input types we need to build a cap table

import { BestFit } from "./conversion-solver";
import { getCapForSafe } from "./safe-calcs";
import { roundShares } from "./utils/rounding";

export type BaseStake = {
  name?: string;
  shares?: number;
  type: "common" | "safe" | "series";
}

export type CommonStockholder = BaseStake & {
  name: string;
  shares: number;
  type: "common";
  commonType: "shareholder" | "unusedOptions";
}

export type SAFENote = BaseStake & {
  name?: string;
  investment: number;
  cap: number;
  discount: number;
  type: "safe";
  // TODO: Pro-Rata is not implemented yet
  sideLetters?: ("mfn"|"pro-rata")[];
  conversionType: "pre" | "post" | "mfn" | "yc7p" | "ycmfn";
}

export type SeriesInvestor = BaseStake & {
  name?: string;
  investment: number;
  type: "series";
  round: number;
}

export type StakeHolder = CommonStockholder | SAFENote | SeriesInvestor;


// Cap table return types below. These are the types of rows that can be in a cap table

export type CapTableOwnershipError = {
  type: "tbd";
}

export type BaseCapTableRow = {
  name?: string;
}

export type TotalCapTableRow = BaseCapTableRow & {
  type: "total";
  investment: number;
  shares: number;
  ownershipPct: number;
};

export type CommonCapTableRow = BaseCapTableRow & {
  type: "common";
  shares: number;
  ownershipPct: number;
};

export type SafeCapTableRow = BaseCapTableRow & {
  type: "safe";
  investment: number;
  cap?: number;
  pps?: number;
  shares?: number;
  ownershipPct?: number;
  ownershipError?: "tbd" | "over" | "error";
  ownershipNotes?: string;
};

export type SeriesCapTableRow = BaseCapTableRow & {
  type: "series";
  investment: number;
  shares: number;
  ownershipPct: number;
};

export type RefreshedOptionsCapTableRow = BaseCapTableRow & {
  type: "refreshedOptions";
  shares: number;
  ownershipPct: number;
};


export type CapTableRow = TotalCapTableRow | SafeCapTableRow | SeriesCapTableRow | CommonCapTableRow | RefreshedOptionsCapTableRow;

// Very basic implementation of the ownership calculation before any rounds, including SAFE Notes
export const getCapTableOwnership = (commonStockholders: CommonStockholder[]): CommonCapTableRow[] => {
  const totalCommonShares = commonStockholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);
  return commonStockholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalCommonShares,
      type: "common",
      pps: -1
    }
  })
}

export const buildPreRoundCapTable = (stakeHolders: StakeHolder[]): {common: CommonCapTableRow[], safes: SafeCapTableRow[], total: TotalCapTableRow, error?: CapTableOwnershipError} => {
  const commonStockholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common") as CommonStockholder[];
  const totalCommonShares = commonStockholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);

  let safeNotes = stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[];
  const totalSafeInvestment = safeNotes.reduce((acc, stockholder) => acc + stockholder.investment, 0);

  // Calculate the cap value for the MFN safes
  safeNotes = safeNotes.map((safe, idx) => {
    if (safe.conversionType === "mfn" || safe.conversionType === "ycmfn" || safe.sideLetters?.includes("mfn")) {
      const cap = getCapForSafe(idx, safeNotes);
      return { ...safe, cap }
    }
    return { ...safe }
  })

  // This math is pre-round math, so it's just the ownership percentage
  const safeCapTable: SafeCapTableRow[] = safeNotes.map((safe) => {
    let ownershipPct = -1
    if (safe.cap === 0) {
      return {
        name: safe.name,
        cap: safe.cap,
        ownershipPct,
        ownershipError: "tbd",
        ownershipNotes: "No cap set for this SAFE, ownership percentage is TBD",
        investment: safe.investment,
        type: "safe",
        pps: -1
      }
    } else if (safe.cap <= safe.investment) {
      return {
        name: safe.name,
        ownershipError: "error",
        ownershipNotes: "Cap is less than or equal to investment, ownership percentage is over 100%. Inconceievable!",
        investment: safe.investment,
        type: "safe",
        pps: -1
      }
    }
    if (safe.conversionType === "pre") {
      ownershipPct = safe.investment / (safe.cap + totalSafeInvestment);

    } else {
      ownershipPct = safe.investment / safe.cap;
    }
    return {
      name: safe.name,
      investment: safe.investment,
      cap: safe.cap,
      ownershipPct,
      type: "safe",
      pps: -1
    }
  })

  const totalSafeOwnershipPct = safeCapTable.reduce((acc, safe) => acc + (safe.ownershipPct ?? 0), 0);
  const commonCapTable: CommonCapTableRow[] = commonStockholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: (stockholder.shares / totalCommonShares) * (1 - totalSafeOwnershipPct),
      type: "common",
      pps: -1
    }
  })

  return {
    common: commonCapTable,
    safes: safeCapTable,
    total: {
      name: "Total",
      // In a pre-round cap table, the total shares are just the common shares since we can't know the PPS yet
      shares: totalCommonShares,
      investment: totalSafeInvestment,
      ownershipPct: 1,
      type: "total",
    },
    error: undefined
  }
}

export const buildPricedRoundCapTable = (pricedConversion: BestFit, stakeHolders: StakeHolder[]): 
  {
    common: CommonCapTableRow[],
    safes: SafeCapTableRow[],
    series: SeriesCapTableRow[],
    refreshedOptionsPool: RefreshedOptionsCapTableRow,
    total: TotalCapTableRow,
    error?: CapTableOwnershipError
  } => {
  const commonShareholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common" && stakeHolder.commonType !== 'unusedOptions') as CommonStockholder[];
  const safeNotes = stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[];
  const seriesInvestors = stakeHolders.filter((stakeHolder) => stakeHolder.type === "series") as SeriesInvestor[];
  const totalShares = pricedConversion.totalShares;

  const totalInvestment = [...seriesInvestors, ...safeNotes].reduce((acc, investor) => acc + investor.investment, 0);

  const commonCapTable: CommonCapTableRow[] = commonShareholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalShares,
      type: "common",
    }
  })

  const safeCapTable: SafeCapTableRow[] = safeNotes.map((safe, idx) => {
    const pps = pricedConversion.ppss[idx];
    const shares = roundShares(safe.investment / pps, pricedConversion.roundingStrategy);
    const ownershipPct = shares / totalShares;
    return {
      name: safe.name,
      investment: safe.investment,
      ownershipPct,
      shares,
      type: "safe",
      pps,
    }
  })

  const seriesCapTable: SeriesCapTableRow[] = seriesInvestors.map((seriesInvestor) => {
    const shares = roundShares(seriesInvestor.investment / pricedConversion.pps, pricedConversion.roundingStrategy);
    return {
      name: seriesInvestor.name,
      investment: seriesInvestor.investment,
      shares: shares,
      ownershipPct: shares / totalShares,
      pps: pricedConversion.pps,
      type: "series",
    }
  })
  
  const refreshedOptionsPool: RefreshedOptionsCapTableRow = {
    name: "Refreshed Options Pool",
    shares: pricedConversion.totalOptions,
    ownershipPct: pricedConversion.totalOptions / totalShares,
    type: "refreshedOptions"
  }

  return {
    common: commonCapTable,
    safes: safeCapTable,
    series: seriesCapTable,
    refreshedOptionsPool,
    total: {
      name: "Total",
      // In a pre-round cap table, the total shares are just the common shares since we can't know the PPS yet
      shares: totalShares,
      investment: totalInvestment,
      ownershipPct: 1,
      type: "total",
    },
    error: undefined
  }
}

