import { initialState, randomFounders, randomSeed, randomSeries } from "./initialState";
import { create } from 'zustand'
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { calcSAFEPcts, getCapForSafe } from "@/app/utils/rowDataHelper";
import { stringToNumber } from "@/app/utils/numberFormatting";


export interface SeriesRowState {
  id: string;
  type: "series";
  name: string;
  investment: number;
}

export interface SAFERowState {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  conversionType: "post" | "pre" | "mfn" ;
}

export interface ExistingShareholderState {
  id: string;
  type: "common";
  name: string;
  shares: number;
}

export interface ExistingShareholderData extends ExistingShareholderState {
    ownershipPct: number;
    dilutedPct: number;
    dilutedPctError?: string;
    allowDelete?: boolean;
}

export interface SAFERowData extends SAFERowState {
    ownershipPct: number;
    ownershipError?: string;
    allowDelete?: boolean;
    disabledFields?: string[];
}

export interface SeriesRowData extends SeriesRowState {
    ownershipPct: number;
    allowDelete?: boolean;
}

export type IRowState = SAFERowState | ExistingShareholderState | SeriesRowState

// The only thing we need to serialize
export interface IConversionStateData {
  hasNewRound?: boolean;
  targetOptionsPool: number;
  rowData: IRowState[];
  unusedOptions: number;
  preMoney: number;
}

export interface IConversionState extends IConversionStateData {
  onAddRow: (type: "safe" | "series" | "common") => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (data: IRowState) => void;
  togglePricedRound: (on?: boolean) => void;
  onValueChange: (type: "number" | "percent") => (val: string | undefined, name: string | undefined, values?: CurrencyInputOnChangeValues) => void;
}


export const useConversionStore = create<IConversionState>((set, get) => ({
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
      ) as ExistingShareholderData[]
    )
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const totalShares = commonStock;
    const pricedConversion = fitConversion(
      stringToNumber(preMoney),
      totalShares,
      (rowData.filter((row) => row.type === "safe") as SAFERowData[]).map(
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
      (rowData.filter((row) => row.type === "series") as SeriesRowData[]).map(
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
    (pricedConversion, rowData): SAFERowData[] => {
        const rows = rowData.filter((row) => row.type === "safe");

        const safeOwnershipPct = calcSAFEPcts(rowData, pricedConversion);

        const safeCaps = rows.map((safe) => {
            return getCapForSafe(safe, rows);
        });


        return rows.map((row, idx) => {
            let ownershipError = undefined
            if (row.cap < row.investment) {
                ownershipError = "Error"
            } else if (row.cap === 0) {
                ownershipError = "TBD"
            }
            return {
                id: row.id,
                type: "safe",
                name: row.name,
                investment: row.investment,
                cap: safeCaps[idx],
                discount: row.discount,
                ownershipPct: safeOwnershipPct[idx],
                ownershipError,
                allowDelete: rows.length > 1,
                disabledFields: row.conversionType === 'mfn' ? ['cap'] : [],
                conversionType: row.conversionType,
            };
        });
    },
);

export const getExistingShareholderPropsSelector = createSelector(
    getPricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): ExistingShareholderData[] => {
        const safeTotalOwnershipPct = calcSAFEPcts(rowData, pricedConversion).reduce((acc, val) => acc + val, 0);
        const tbdSafes = rowData.filter((row) => row.type === "safe" && row.cap === 0).length > 0;
        const errSafes = rowData.filter((row) => row.type === "safe" && row.cap < row.investment).length > 0;

        const existingShareholders = rowData.filter((row) => row.type === "common");
        const totalInitialShares = existingShareholders.map((row) => row.shares)
            .reduce((acc, val) => acc + val, 0);

        const shareholdersPct: [number, number, number][] = existingShareholders.map((data) => {
            const startingOwnershipPct = (data.shares / totalInitialShares)
            const preConversionOwnership = (100 - safeTotalOwnershipPct) * startingOwnershipPct
            return [
            100 * startingOwnershipPct,
            tbdSafes ? 0 : preConversionOwnership,
            100 * (data.shares / (pricedConversion?.totalShares ?? data.shares)),
            ];
        });
        
        let dilutedPctError = undefined
        if (tbdSafes) {
            dilutedPctError = "TBD"
        } else if (errSafes) {
            dilutedPctError = "Error"
        }

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
    (pricedConversion, rowData): SeriesRowData[] => {
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