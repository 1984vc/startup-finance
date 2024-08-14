import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { ExistingShareholderProps } from "@/components/safe-conversion/Conversion/ExistingShareholders"

export const getExistingShareholderPropsSelector = createSelector(
  getPricedConversion,
  getSAFERowPropsSelector,
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.unusedOptions,
  (
    pricedConversion,
    safes,
    rowData,
  ): ExistingShareholderProps[] => {
    const safeTotalOwnershipPct = safes.reduce(
      (acc, val) => acc + val.ownership[0].percent,
      0,
    );
    // Look through the SAFEs and find out if any have an OwnershipError
    // If so, we need to show an error on the dilutedPct
    const dilutedPctError = safes.some(
      (safe) => safe.ownership[0].error === "Error",
    )
      ? "Error"
      : safes.some((safe) => safe.ownership[0].error === "TBD")
        ? "TBD"
        : undefined;

    const existingShareholders = rowData.filter((row) => row.type === "common");

    const totalInitialShares = existingShareholders
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const shareholdersPct: {
      shares: number;
      percent: number;
      error?: string;
    }[][] =
      existingShareholders.map((data) => {
        const startingOwnership = {
          shares: data.shares,
          percent: data.shares / totalInitialShares * 100,
        }
        const preConversionOwnership = {
          shares: data.shares,
          percent: ((100 - safeTotalOwnershipPct) * (startingOwnership.percent / 100)),
          error: dilutedPctError,
        };
        const pricedRoundOwnership = {
          shares: data.shares,
          percent: 100 * (data.shares / (pricedConversion?.totalShares ?? data.shares)),
        };
        return [
          startingOwnership,
          preConversionOwnership,
          pricedRoundOwnership
        ];
      });

    return existingShareholders.map((row, idx) => {
      return {
        id: row.id,
        type: "common",
        name: row.name,
        shares: row.shares,
        ownership: shareholdersPct[idx],
        allowDelete: existingShareholders.length > 1,
      };
    });
  },
);
