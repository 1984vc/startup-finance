// These are all the input types we need to build a cap table

import { getCapForSafe } from "./safe-calcs";

export interface IStake {
  name?: string;
  shares?: number;
  type: "common" | "safe" | "series";
}

export interface ICommonStockholder extends IStake {
  name: string;
  shares: number;
  type: "common";
  commonType: "shareholder" | "unusedOptions";
}

export interface ISafeNote extends IStake {
  name?: string;
  investment: number;
  cap: number;
  discount: number;
  type: "safe";
  sideLetters?: ("mfn"|"pro-rata")[];
  conversionType: "pre" | "post" | "mfn" | "yc7p" | "ycmfn";
}

export interface SeriesInvestor extends IStake {
  name?: string;
  investment: number;
  type: "series";
  round: number;
}

export type StakeHolder = ICommonStockholder | ISafeNote | SeriesInvestor;

export type CapTableOwnershipError = {
  type: "tbd";
}

export type BaseCapTableRow = {
  name?: string;
  cap?: number;
  shares?: number;
  investment?: number;
  pps?: number;
}

type TotalCapTableRow = Omit<BaseCapTableRow, 'type' | 'pps'> & {
  type: "total";
  investment: number;
  shares: number;
  ownershipPct: number;
};

type CommonCapTableRow = Omit<BaseCapTableRow, 'type' | 'pps'> & {
  type: "common";
  shares: number;
  ownershipPct: number;
};

type SafeCapTableRow = Omit<BaseCapTableRow, 'type' | 'pps'> & {
  type: "safe";
  investment: number;
  cap?: number;
  pps?: number;
  shares?: number;
  ownershipPct?: number;
  ownershipError?: "tbd" | "over" | "error";
  ownershipNotes?: string;
};

type SeriesCapTableRow = Omit<BaseCapTableRow, 'type' | 'pps'> & {
  type: "series";
  investment: number;
  shares: number;
  ownershipPct: number;
};

export type CapTableRow = TotalCapTableRow | SafeCapTableRow | SeriesCapTableRow | CommonCapTableRow;

// Very basic implementation of the ownership calculation before any rounds
export const getCapTableOwnership = (commonStockholders: ICommonStockholder[]): CapTableRow[] => {
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
  const commonStockholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common") as ICommonStockholder[];
  const totalCommonShares = commonStockholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);

  let safeNotes = stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as ISafeNote[];
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