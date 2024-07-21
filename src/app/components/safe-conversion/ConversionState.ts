import { SAFEProps } from "./SafeNoteList";
import { ExistingShareholderProps } from "./ExistingShareholders";
import { SeriesInputData } from "./SeriesInvestmentList";
import { initialState } from "./initialState";
import { create } from 'zustand'
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { calcSAFEPcts, getCapForSafe } from "@/app/utils/rowDataHelper";
import { stringToNumber } from "@/app/utils/numberFormatting";

export type IRowData = SAFEProps | ExistingShareholderProps | SeriesInputData

export interface IConversionState {
  randomFounders: string[];
  randomSeed: string[];
  randomSeries: string[];
  hasNewRound?: boolean;
  targetOptionsPool: number;
  rowData: IRowData[];
  unusedOptions: number;
  preMoney: number;
  onAddRow: (type: "safe" | "series" | "common") => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (data: IRowData) => void;
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
              state.randomSeed[
                state.rowData.filter((r) => r.type === "safe").length %
                  state.randomSeed.length
              ]
            }`,
            investment: 0,
            cap: 0,
            discount: 0,
            ownershipPct: 0,
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
      (rowData.filter((row) => row.type === "series") as SeriesInputData[]).map(
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
                disabledFields: row.conversionType === 'mfn' ? ['cap'] : [],
                conversionType: row.conversionType,
            };
        });
    },
);

export const getExistingShareholderPropsSelector = createSelector(
    getPricedConversion,
    (state: IConversionState) => state.rowData,
    (pricedConversion, rowData): ExistingShareholderProps[] => {
        const safeTotalOwnershipPct = calcSAFEPcts(rowData, pricedConversion).reduce((acc, val) => acc + val, 0);
        const tbdSafes = rowData.filter((row) => row.type === "safe" && row.cap === 0).length > 0;

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
