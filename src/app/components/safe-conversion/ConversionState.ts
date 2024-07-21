import { SAFEInputData, SAFEProps } from "./SafeNoteList";
import { ExistingShareholderProps } from "./ExistingShareholders";
import { SeriesInputData } from "./SeriesInvestmentList";
import { initialState } from "./initialState";
import { create } from 'zustand'
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit } from "@/library/safe_conversion";
import { calcSAFEPcts, getCapForSafe } from "@/app/utils/rowDataHelper";

export type IRowData = SAFEInputData | ExistingShareholderProps | SeriesInputData;

export interface IConversionState {
  randomFounders: string[];
  randomSeed: string[];
  randomSeries: string[];
  hasNewRound?: boolean;
  targetOptionsPool: number;
  rowData: IRowData[];
  unusedOptions: number;
  preMoney: number;
  pricedConversion?: BestFit;
  onAddRow: (type: "safe" | "series" | "common") => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (data: IRowData) => void;
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
              state.randomSeed[
                state.rowData.filter((r) => r.type === "safe").length %
                  state.randomSeed.length
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
              state.randomFounders[
                state.rowData.filter((r) => r.type === "common").length %
                  state.randomFounders.length
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
              state.randomSeries[
                state.rowData.filter((r) => r.type === "series").length %
                  state.randomSeries.length
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

  onUpdateRow: (data: IRowData) => {
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
}));

export const getSAFERowPropsSelector = createSelector(
    (state: IConversionState) => state.pricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): SAFEProps[] => {
        const rows = rowData.filter((row) => row.type === "safe");

        const safeOwnershipPct = calcSAFEPcts(rowData, pricedConversion);

        const safeCaps = rows.map((safe) => {
            return getCapForSafe(safe, rows);
        });

        return rows.map((row, idx) => {
            return {
                id: row.id,
                type: "safe",
                name: row.name,
                investment: row.investment,
                cap: safeCaps[idx],
                discount: row.discount,
                ownershipPct: safeOwnershipPct[idx],
                allowDelete: true,
                conversionType: row.conversionType,
            };
        });
    },
);

export const getExistingShareholderPropsSelector = createSelector(
    (state: IConversionState) => state.pricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): ExistingShareholderProps[] => {
        const safeTotalOwnershipPct = calcSAFEPcts(rowData, pricedConversion).reduce((acc, val) => acc + val, 0);

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
            };
        });
    }
)
