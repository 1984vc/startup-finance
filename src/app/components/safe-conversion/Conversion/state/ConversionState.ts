import { randomFounders, randomSeed, randomSeries } from "./initialState";
import { create } from 'zustand'
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { calcSAFEsPctAndCap } from "@/app/utils/rowDataHelper";
import { stringToNumber } from "@/app/utils/numberFormatting";


export interface SeriesState {
  id: string;
  type: "series";
  name: string;
  investment: number;
}

export interface SeriesProps extends SeriesState {
    ownershipPct: number;
    allowDelete?: boolean;
}

export interface SAFEState {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  conversionType: "post" | "pre" | "mfn" ;
}

export interface SAFEProps extends SAFEState {
    ownershipPct: number;
    ownershipError?: string;
    allowDelete?: boolean;
    disabledFields?: string[];
}

export interface ExistingShareholderState {
  id: string;
  type: "common";
  name: string;
  shares: number;
}

export interface ExistingShareholderProps extends ExistingShareholderState {
    ownershipPct: number;
    dilutedPct: number;
    dilutedPctError?: string;
    allowDelete?: boolean;
}


export type IRowState = SAFEState | ExistingShareholderState | SeriesState

// The only thing we need to serialize
export interface IConversionStateData {
  hasNewRound?: boolean;
  targetOptionsPool: number;
  rowData: IRowState[];
  unusedOptions: number;
  preMoney: number;
}

export type ConversionStore = ReturnType<typeof createConversionStore>

export interface IConversionState extends IConversionStateData {
  onAddRow: (type: "safe" | "series" | "common") => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (data: IRowState) => void;
  togglePricedRound: (on?: boolean) => void;
  onValueChange: (type: "number" | "percent") => (val: string | undefined, name: string | undefined, values?: CurrencyInputOnChangeValues) => void;
}

const determineRowError = (row: IRowState, pricedConversion: BestFit | undefined): string | undefined => {
    if (row.type === "safe") {
        const safe = row as SAFEProps;
        if (safe.cap === 0) {
            if (pricedConversion) {
              return undefined
            }
            return "TBD"
        }
        else if (safe.cap < safe.investment) {
            return "Error"
        }
    }
    return undefined
}

export const createConversionStore = (initialState: IConversionStateData) => create<IConversionState>((set, get) => ({
  ...initialState,

  onAddRow: (type: "safe" | "series" | "common") => {
    if (type === "safe") {
      set((state) => ({
        ...state,
        rowData: [
          ...state.rowData,
          {
            id: crypto.randomUUID(),
            type: "safe",
            name: `${
              randomSeed[
                state.rowData.filter((r) => r.type === "safe").length %
                  randomSeed.length
              ]
            }`,
            investment: 0,
            cap: 0,
            discount: 0,
            conversionType: "post",
          },
        ],
      }));
    } else if (type === "common") {
      set((state) => ({
        ...state,
        rowData: [
          ...state.rowData,
          {
            id: crypto.randomUUID(),
            type: "common",
            name: `${
              randomFounders[
                state.rowData.filter((r) => r.type === "common").length %
                  randomFounders.length
              ]
            }`,
            shares: 0,
          },
        ],
      }));
    } else if (type === "series") {
      set((state) => ({
        ...state,
        rowData: [
          ...state.rowData,
          {
            id: crypto.randomUUID(),
            type: "series",
            name: `${
              randomSeries[
                state.rowData.filter((r) => r.type === "series").length %
                  randomSeries.length
              ]
            }`,
            investment: 0,
          },
        ],
      }));
    }
  },

  onDeleteRow: (id: string): void => {
    console.log("delete ", id);
    set((state) => ({
      ...state,
      rowData: state.rowData.filter((row) => row.id !== id),
    }));
  },

  onUpdateRow: (data: IRowState) => {
    console.log("update", data)
    set((state) => ({
      ...state,
      rowData: state.rowData.map((row) => (row.id === data.id ? data : row)),
    }));
  },

  onValueChange:
    (type: "number" | "percent") =>
    (
      value: string | undefined,
      name: string | undefined,
      values?: CurrencyInputOnChangeValues
    ) => {
      if (type === "number") {
        if (name) {
          let val = values?.float ?? 0;
          if (val < 0) {
            return;
          }
          // Get the value and replace anything that's not a number or period
          const newValue = value?.replace(/[^0-9.]/g, "");
          set((state) => ({
            ...state,
            [name]: newValue ?? "0",
          }));
        }
      } else if (type === "percent") {
        if (name) {
          let val = values?.float ?? 0;
          if (val > 99 || val < 0) {
            return;
          }
          const newValue = value?.replace(/[^0-9.]/g, "");
          set((state) => ({
            ...state,
            [name]: newValue ?? "0",
          }));
        }
      }
    },
    togglePricedRound: (on?: boolean) => {
        set((state) => ({
            ...state,
            hasNewRound: on ?? false,
        }));
    }
}));

export const getPricedConversion = createSelector(
  (state: IConversionState) => state.rowData,
  (state: IConversionState) => state.preMoney,
  (state: IConversionState) => state.targetOptionsPool,
  (state: IConversionState) => state.unusedOptions,
  (state: IConversionState) => state.hasNewRound,
  (
    rowData,
    preMoney,
    targetOptionsPool,
    unusedOptions,
    hasNewRound
  ): BestFit | undefined => {
    if (!hasNewRound) {
      return undefined;
    }
    const commonStock = (
      rowData.filter(
        (row) => row.type === "common"
      ) as ExistingShareholderProps[]
    )
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const totalShares = commonStock;
    const pricedConversion = fitConversion(
      stringToNumber(preMoney),
      totalShares,
      (rowData.filter((row) => row.type === "safe") as SAFEProps[]).map(
        (row) => {
          return {
            investment: stringToNumber(row.investment),
            cap: stringToNumber(row.cap),
            discount: stringToNumber(row.discount) / 100,
            conversionType: row.conversionType,
          };
        }
      ),
      stringToNumber(unusedOptions),
      stringToNumber(targetOptionsPool) / 100,
      (rowData.filter((row) => row.type === "series") as SeriesProps[]).map(
        (row) => row.investment
      ),
      { roundDownShares: true, roundPPSPlaces: 5 }
    );
    return pricedConversion;
  }
);


export const getSAFERowPropsSelector = createSelector(
    getPricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): SAFEProps[] => {
        const rows = rowData.filter((row) => row.type === "safe");

        const safeCalcs = calcSAFEsPctAndCap(rows, pricedConversion);

        return rows.map((row, idx) => {
            const rowResult: SAFEProps = {
                id: row.id,
                type: "safe",
                name: row.name,
                investment: row.investment,
                cap: safeCalcs[idx][1],
                discount: row.discount,
                ownershipPct: safeCalcs[idx][0],
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

export const getExistingShareholderPropsSelector = createSelector(
    getPricedConversion,
    getSAFERowPropsSelector,
    (state: IConversionState) => state.rowData,
    (pricedConversion, safes, rowData): ExistingShareholderProps[] => {
        const safeTotalOwnershipPct = safes.reduce((acc, val) => acc + val.ownershipPct, 0);
        // Look through the SAFEs and find out if any have an OwnershipError
        // If so, we need to show an error on the dilutedPct
        const dilutedPctError = safes.some((safe) => safe.ownershipError === "Error") ? "Error" :
          safes.some((safe) => safe.ownershipError === "TBD") ? "TBD" : undefined;

        const existingShareholders = rowData.filter((row) => row.type === "common");
        const totalInitialShares = existingShareholders.map((row) => row.shares)
            .reduce((acc, val) => acc + val, 0);

        const shareholdersPct: [number, number, number][] = existingShareholders.map((data) => {
            const startingOwnershipPct = (data.shares / totalInitialShares)
            const preConversionOwnership = (100 - safeTotalOwnershipPct) * startingOwnershipPct
            return [
                100 * startingOwnershipPct,
                preConversionOwnership,
                100 * (data.shares / (pricedConversion?.totalShares ?? data.shares)),
            ];
        });
        

        return existingShareholders.map((row, idx) => {
            return {
                id: row.id,
                type: "common",
                name: row.name,
                shares: row.shares,
                ownershipPct: shareholdersPct[idx][0],
                dilutedPct: pricedConversion ? shareholdersPct[idx][2] : shareholdersPct[idx][1],
                dilutedPctError,
                allowDelete: existingShareholders.length > 1,
            };
        });
    }
)

export const getSeriesPropsSelector = createSelector(
    getPricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): SeriesProps[] => {
        const rows = rowData.filter((row) => row.type === "series");
        const seriesOwnershipPct = rows.map((data, idx) => {
            if (!pricedConversion) return 0;
            const shares = Math.floor(data.investment / pricedConversion.pps);
            return (shares / pricedConversion.totalShares) * 100;
        });

        return rows.map((row, idx) => {
            return {
                id: row.id,
                type: "series",
                name: row.name,
                investment: row.investment,
                ownershipPct: seriesOwnershipPct[idx] ?? 0,
                allowDelete: rows.length > 1,
            };
        });
    }
)