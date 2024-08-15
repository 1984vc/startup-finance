import { createSelector } from "reselect";
import { getSAFERowPropsSelector } from "./SAFESelector";

type ErrorSelectorState = {
  commonStockError: boolean;
  safeError: boolean;
  seriesError: boolean;
};

// Determine if we have an error that keeps us from calculating the cap table
export const getErrorSelector = createSelector(
  getSAFERowPropsSelector,
  (safeInvestors): ErrorSelectorState => {
    const hasSafeError = safeInvestors.some((row) => row.ownership[0].note?.error === "Error");

    // For future use
    return {
      commonStockError: false,
      safeError: hasSafeError,
      seriesError: false,
    }

  },
);
