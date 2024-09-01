// These are all the input types we need to build a cap table

import { BestFit, DEFAULT_ROUNDING_STRATEGY, fitConversion } from "./conversion-solver";
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
  investment: number;
  cap: number;
  discount: number;
  type: "safe";
  // TODO: Pro-Rata is not implemented yet
  sideLetters?: ("mfn"|"pro-rata")[];
  conversionType: "pre" | "post" | "mfn" | "yc7p" | "ycmfn";
}

export type SeriesInvestor = BaseStake & {
  investment: number;
  type: "series";
  round: number;
}

export type StakeHolder = CommonStockholder | SAFENote | SeriesInvestor;


// Cap table return types below. These are the types of rows that can be in a cap table

export type CapTableOwnershipError = {
  type: "tbd" | "error" | "over";
  reason?: string
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
  discount: number;
  cap: number;
  pps?: number;
  shares?: number;
  ownershipPct?: number;
  ownershipError?: CapTableOwnershipError["type"];
  ownershipNotes?: string;
};

export type SeriesCapTableRow = BaseCapTableRow & {
  type: "series";
  investment: number;
  shares: number;
  pps: number;
  ownershipPct: number;
};

export type RefreshedOptionsCapTableRow = BaseCapTableRow & {
  type: "refreshedOptions";
  shares: number;
  ownershipPct: number;
};


export type CapTableRow = TotalCapTableRow | SafeCapTableRow | SeriesCapTableRow | CommonCapTableRow | RefreshedOptionsCapTableRow;

// Very basic implementation of the ownership calculation before any rounds, including SAFE Notes
export const buildCapTableOwnership = (commonStockholders: CommonStockholder[]): CommonCapTableRow[] => {
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
  const commonShareholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common" && stakeHolder.commonType !== 'unusedOptions') as CommonStockholder[];
  const unusedOptionsRows = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common" && stakeHolder.commonType === 'unusedOptions') as CommonStockholder[];
  let unusedOptions = 0
  if (unusedOptionsRows.length > 0) {
    unusedOptions = unusedOptionsRows[0].shares
  }
  const totalCommonShares = commonShareholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);

  let safeNotes = stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[]
  // Get the cap for MFN
  safeNotes = safeNotes.map((safe, idx): SAFENote => {
    if (safe.conversionType === "mfn" || safe.conversionType === "ycmfn" || safe.sideLetters?.includes("mfn")) {
      const cap = getCapForSafe(idx, safeNotes);
       return { ...safe, cap }
    }
    return {...safe}
  })


  const postMoney = safeNotes.reduce((max, stakeholder) => Math.max(max, stakeholder.cap), 0)
  const pricedConversion = fitConversion(postMoney, totalCommonShares, safeNotes, unusedOptions, 0, [], DEFAULT_ROUNDING_STRATEGY)

  const totalInvestment = [...safeNotes].reduce((acc, investor) => acc + investor.investment, 0);
  const totalShares = pricedConversion.totalShares;

  const commonCapTable: CommonCapTableRow[] = commonShareholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalShares,
      type: "common",
    }
  })
  commonCapTable.push({
    name: "Unused Options",
    shares: unusedOptions,
    ownershipPct: unusedOptions / totalShares,
    type: "common"
  })

  const safeCapTable: SafeCapTableRow[] = safeNotes.map((safe, idx) => {
    const pps = pricedConversion.ppss[idx];
    const shares = roundShares(safe.investment / pps, pricedConversion.roundingStrategy);
    const ownershipPct = shares / totalShares;
    if (safe.cap === 0) {
      return {
        name: safe.name,
        cap: safe.cap,
        discount: safe.discount,
        ownershipPct,
        ownershipError: "tbd",
        ownershipNotes: "No cap set for this SAFE, ownership percentage is TBD",
        investment: safe.investment,
        type: "safe",
        pps: -1
      }
    } else if (safe.cap <= safe.investment) {
      console.log("error row", safe.name)
      return {
        name: safe.name,
        discount: safe.discount,
        cap: safe.cap,
        ownershipError: "error",
        ownershipNotes: "Cap is less than or equal to investment, ownership percentage is over 100%. Inconceivable!",
        investment: safe.investment,
        type: "safe",
        pps: -1
      }
    }
    return {
      name: safe.name,
      investment: safe.investment,
      ownershipPct,
      discount: safe.discount,
      cap: safe.cap,
      type: "safe",
      pps,
    }
  })

  return {
    common: commonCapTable,
    safes: safeCapTable,
    total: {
      name: "Total",
      // In a pre-round cap table, the total shares are just the common shares since we can't know the PPS yet
      shares: totalCommonShares + unusedOptions,
      investment: totalInvestment,
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
      discount: safe.discount,
      cap: safe.cap,
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

