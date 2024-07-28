import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { getSAFERowPropsSelector } from "./SAFESelector";
import { ExistingShareholderProps } from "@/app/components/safe-conversion/Conversion/ExistingShareholders";

export const getExistingShareholderPropsSelector = createSelector(
  getPricedConversion,
  getSAFERowPropsSelector,
  (state: IConversionStateData) => state.rowData,
  (pricedConversion, safes, rowData): ExistingShareholderProps[] => {
    const safeTotalOwnershipPct = safes.reduce(
      (acc, val) => acc + val.ownershipPct,
      0,
    );
    // Look through the SAFEs and find out if any have an OwnershipError
    // If so, we need to show an error on the dilutedPct
    const dilutedPctError = safes.some(
      (safe) => safe.ownershipError === "Error",
    )
      ? "Error"
      : safes.some((safe) => safe.ownershipError === "TBD")
        ? "TBD"
        : undefined;

    const existingShareholders = rowData.filter((row) => row.type === "common");
    const totalInitialShares = existingShareholders
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const shareholdersPct: [number, number, number][] =
      existingShareholders.map((data) => {
        const startingOwnershipPct = data.shares / totalInitialShares;
        const preConversionOwnership =
          (100 - safeTotalOwnershipPct) * startingOwnershipPct;
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
        dilutedPct: pricedConversion
          ? shareholdersPct[idx][2]
          : shareholdersPct[idx][1],
        dilutedPctError,
        allowDelete: existingShareholders.length > 1,
      };
    });
  },
);
