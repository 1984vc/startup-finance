// These are all the input types we need to build a cap table

import { buildEstimatedPreRoundCapTable, buildPreRoundCapTable } from "./pre-round";
import { buildPricedRoundCapTable } from "./priced-round";

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
  type: "tbd" | "error" | "caveat";
  reason?: string
}

export type BaseCapTableRow = {
  name?: string;
  ownershipPct?: number;
  ownershipError?: CapTableOwnershipError
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
  commonType: CommonStockholder["commonType"];
};

export type SafeCapTableRow = BaseCapTableRow & {
  type: "safe";
  investment: number;
  discount: number;
  cap: number;
  pps?: number;
  shares?: number;
  ownershipPct?: number;
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
export const buildExistingShareholderCapTable = (commonStockholders: CommonStockholder[]): CommonCapTableRow[] => {
  const totalCommonShares = commonStockholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);
  return commonStockholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalCommonShares,
      type: "common",
      commonType: stockholder.commonType,
    }
  })
}

export {
  buildPreRoundCapTable,
  buildEstimatedPreRoundCapTable,
  buildPricedRoundCapTable,
}
