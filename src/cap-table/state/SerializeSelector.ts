import { createSelector } from "reselect";
import { IConversionStateData } from "./ConversionState";

// Determine if we have an error that keeps us from calculating the cap table
export const getSerializedSelector = createSelector(
  (state) => state,
  (state): IConversionStateData => {
    const { preMoney, targetOptionsPool, unusedOptions, rowData, pricedRounds } = state;
    return {
      preMoney,
      targetOptionsPool,
      unusedOptions,
      rowData,
      pricedRounds
    }

  },
);
