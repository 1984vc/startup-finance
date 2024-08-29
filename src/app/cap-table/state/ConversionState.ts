import { randomFounders, randomSeed, randomSeries } from "./initialState";
import { create } from "zustand";
import { createSelector } from "reselect";
import { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { BestFit, fitConversion } from "@library/conversion-solver";
import { stringToNumber } from "@/utils/numberFormatting";
import { SeriesProps } from "@/components/safe-conversion/Conversion/SeriesInvestorList";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";
import { ExistingShareholderProps } from "@/components/safe-conversion/Conversion/ExistingShareholders";
import { getCapForSafe } from "@/utils/rowDataHelper";

// Only the state that we need to serialize
export type ExistingShareholderState = Pick<
  ExistingShareholderProps,
  "id" | "type" | "name" | "shares"
>;
export type SAFEState = Pick<
  SAFEProps,
  "id" | "type" | "name" | "investment" | "cap" | "discount" | "conversionType" 
>;
export type SeriesState = Pick<
  SeriesProps,
  "id" | "type" | "name" | "investment"
>;

export type IRowState = SAFEState | ExistingShareholderState | SeriesState;

// The only thing we need to serialize
export interface IConversionStateData {
  targetOptionsPool: number;
  rowData: IRowState[];
  unusedOptions: number;
  preMoney: number;
  pricedRounds?: number;
}

export type ConversionStore = ReturnType<typeof createConversionStore>;

export interface IConversionState extends IConversionStateData {
  onAddRow: (type: "safe" | "series" | "common") => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (data: IRowState) => void;
  onValueChange: (
    type: "number" | "percent",
  ) => (
    val: string | undefined,
    name: string | undefined,
    values?: CurrencyInputOnChangeValues,
  ) => void;
  togglepriceRounds: () => void;
}

function getNextIdx(rowData: IRowState[]) {
  // get the highest id from rowData[] and return an increment
  return (
    rowData.map((row) => row.id.match(/^[0-9]+$/) ? parseInt(row.id) : 0).reduce((a, b) => Math.max(a, b), 0) +
    1
  ).toString();
}

function getRandomSeed(rowData: IRowState[]) {
  const existingNames = rowData
    .filter((r) => r.type === "safe")
    .map((r) => r.name);
  const availableNames = randomSeed().filter((r) => !existingNames.includes(r));
  if (availableNames.length > 0) {
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  } else {
    return "Another Seed Investor";
  }
}

function getRandomInvestor(rowData: IRowState[]) {
  const existingNames = rowData
    .filter((r) => r.type === "series")
    .map((r) => r.name);
  const availableNames = randomSeries().filter((r) => !existingNames.includes(r));
  if (availableNames.length > 0) {
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  } else {
    return "Another Series Investor";
  }
}

function getRandomFounder(rowData: IRowState[]) {
  const existingNames = rowData
    .filter((r) => r.type === "common")
    .map((r) => r.name);
  const availableNames = randomFounders().filter(
    (r) => !existingNames.includes(r),
  );
  if (availableNames.length > 0) {
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  } else {
    return "Another Founder";
  }
}



export const createConversionStore = (initialState: IConversionStateData) =>
  create<IConversionState>((set, get) => ({
    ...initialState,

    onAddRow: (type: "safe" | "series" | "common") => {
      const idx = getNextIdx(get().rowData);
      if (type === "safe") {
        set((state) => ({
          ...state,
          rowData: [
            ...state.rowData,
            {
              id: idx,
              type: "safe",
              name: getRandomSeed(state.rowData),
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
              id: idx,
              type: "common",
              name: getRandomFounder(state.rowData),
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
              id: idx,
              type: "series",
              name: getRandomInvestor(state.rowData),
              investment: 0,
            },
          ],
        }));
      }
    },

    onDeleteRow: (id: string): void => {
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
          values?: CurrencyInputOnChangeValues,
        ) => {
          if (type === "number") {
            if (name) {
              const val = values?.float ?? 0;
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
              const val = values?.float ?? 0;
              if (val > 99 || val < 0) {
                return;
              }
              const newValue = value?.replace(/[^0-9.]/g, "");
              const newValueNumber = parseFloat(newValue ?? "0");
              set((state) => ({
                ...state,
                [name]: newValueNumber,
              }));
            }
          }
        },
        togglepriceRounds: () => {
          set((state) => {
            console.log(state.pricedRounds);
            return {
              ...state,
              pricedRounds: state.pricedRounds === 0 ? 1 : 0,
            }
          });

        },
  }));

export const getPricedConversion = createSelector(
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.preMoney,
  (state: IConversionStateData) => state.targetOptionsPool,
  (state: IConversionStateData) => state.unusedOptions,
  (
    rowData,
    preMoney,
    targetOptionsPool,
    unusedOptions,
  ): BestFit => {
    const commonStock = (
      rowData.filter(
        (row) => row.type === "common",
      ) as ExistingShareholderProps[]
    )
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const totalShares = commonStock;
    const safeInvestors = rowData.filter((row) => row.type === "safe") as SAFEProps[];
    const pricedConversion = fitConversion(
      stringToNumber(preMoney),
      totalShares,
      (safeInvestors).map(
        (row) => {
          // Handles MFN and YC MFN safes, finds the best cap
          const calculatedCap = getCapForSafe(row, safeInvestors);
          // We have numerous conversion types, but we need to boil it down to pre or post
          // The YC7P and YCMFN are both post-money safes
          // Just set the conversion type to post if it's not pre
          const conversionType = row.conversionType === "pre" ? "pre" : "post"
          return {
            investment: stringToNumber(row.investment),
            cap: calculatedCap,
            discount: stringToNumber(row.discount) / 100,
            conversionType,
            type: "safe",
          };
        },
      ),
      stringToNumber(unusedOptions),
      stringToNumber(targetOptionsPool) / 100,
      (rowData.filter((row) => row.type === "series") as SeriesProps[]).map(
        (row) => row.investment,
      ),
      { roundShares: true, roundPPSPlaces: 8 },
    );
    return pricedConversion;
  },
);
