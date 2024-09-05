// These are all the input types we need to build a cap table

import { buildEstimatedPreRoundCapTable, buildPreRoundCapTable } from "./pre-round";
import { buildPricedRoundCapTable } from "./priced-round";


export enum CapTableRowType {
  Common = "common",
  Safe = "safe",
  Series = "series",
  Total = "total",
  RefreshedOptions = "refreshedOptions",
}

export enum CommonRowType {
  Shareholder = "shareholder",
  UnusedOptions = "unusedOptions",
}

export type BaseStake = {
  id?: string;
  name?: string;
  shares?: number;
  type: CapTableRowType.Common | CapTableRowType.Safe | CapTableRowType.Series;
}

export type CommonStockholder = BaseStake & {
  name: string;
  shares: number;
  type: CapTableRowType.Common;
  commonType: CommonRowType.Shareholder | CommonRowType.UnusedOptions;
}

export type SAFENote = BaseStake & {
  investment: number;
  cap: number;
  discount: number;
  type: CapTableRowType.Safe;
  // TODO: Pro-Rata is not implemented yet
  sideLetters?: ("mfn" | "pro-rata")[];
  conversionType: "pre" | "post" | "mfn" | "yc7p" | "ycmfn";
}

export type SeriesInvestor = BaseStake & {
  investment: number;
  type: CapTableRowType.Series;
  round: number;
}

export type StakeHolder = CommonStockholder | SAFENote | SeriesInvestor;


// Cap table return types below. These are the types of rows that can be in a cap table

export type CapTableOwnershipError = {
  type: "tbd" | "error" | "caveat";
  reason?: string
}

export type BaseCapTableRow = {
  id?: string;
  name?: string;
  ownershipPct?: number;
  ownershipError?: CapTableOwnershipError
}

export type TotalCapTableRow = BaseCapTableRow & {
  type: CapTableRowType.Total;
  investment: number;
  shares: number;
  ownershipPct: number;
};

export type CommonCapTableRow = BaseCapTableRow & {
  type: CapTableRowType.Common;
  shares: number;
  commonType: CommonRowType;
};

export type SafeCapTableRow = BaseCapTableRow & {
  type: CapTableRowType.Safe;
  investment: number;
  discount: number;
  cap: number;
  pps?: number;
  shares?: number;
  ownershipPct?: number;
};

export type SeriesCapTableRow = BaseCapTableRow & {
  type: CapTableRowType.Series;
  investment: number;
  shares: number;
  pps: number;
  ownershipPct: number;
};

export type RefreshedOptionsCapTableRow = BaseCapTableRow & {
  type: CapTableRowType.RefreshedOptions;
  shares: number;
  ownershipPct: number;
};


export type CapTableRow = TotalCapTableRow | SafeCapTableRow | SeriesCapTableRow | CommonCapTableRow | RefreshedOptionsCapTableRow;

// Very basic implementation of the ownership calculation before any rounds, including SAFE Notes
export const buildExistingShareholderCapTable = (commonStockholders: CommonStockholder[]): CommonCapTableRow[] => {
  const totalCommonShares = commonStockholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);
  return commonStockholders.map((stockholder) => {
    return {
      id: stockholder.id,
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalCommonShares,
      type: CapTableRowType.Common,
      commonType: stockholder.commonType,
    }
  })
}

export {
  buildPreRoundCapTable,
  buildEstimatedPreRoundCapTable,
  buildPricedRoundCapTable,
}
