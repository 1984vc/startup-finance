import { randomFounders, randomSeed, randomSeries } from "./initialState";
import { create } from 'zustand'
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { stringToNumber } from "@/app/utils/numberFormatting";
import { SeriesProps } from "@/app/components/safe-conversion/Conversion/SeriesInvestorList";
import { SAFEProps } from "@/app/components/safe-conversion/Conversion/SafeNoteList";
import { ExistingShareholderProps } from "@/app/components/safe-conversion/Conversion/ExistingShareholders";


// Only the state that we need to serialize
export type ExistingShareholderState = Pick<ExistingShareholderProps, "id" | "type" | "name" | "shares">
export type SAFEState = Pick<SAFEProps, "id" | "type" | "name" | "investment" | "cap" | "discount" | "conversionType">
export type SeriesState = Pick<SeriesProps, "id" | "type" | "name" | "investment">

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
          const newValueNumber = parseFloat(newValue ?? "0");
          set((state) => ({
            ...state,
            [name]: newValueNumber,
          }));
        }
      } else if (type === "percent") {
        if (name) {
          let val = values?.float ?? 0;
          if (val > 99 || val < 0) {
            return;
          }
          const newValue = value?.replace(/[^0-9.]/g, "");
          const newValueNumber = parseFloat(newValue ?? "0");
          set((state) => ({
            ...state,
            [name]: newValueNumber
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
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.preMoney,
  (state: IConversionStateData) => state.targetOptionsPool,
  (state: IConversionStateData) => state.unusedOptions,
  (state: IConversionStateData) => state.hasNewRound,
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
