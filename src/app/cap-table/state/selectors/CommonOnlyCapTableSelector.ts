import { createSelector } from "reselect";
import { ExistingShareholderState, IConversionStateData } from "../ConversionState";
import { ExistingShareholderProps } from "@/components/safe-conversion/Conversion/ExistingShareholders"
import { CommonStockholder, buildExistingShareholderCapTable } from "@library/cap-table";

// The initial shares of the existing shareholders
export const getCommonOnlyCapTable = createSelector(
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.unusedOptions,
  (
    rowData,
    unusedOptions
  ): ExistingShareholderProps[] => {
    const commonStock: CommonStockholder[] = (rowData.filter((row) => row.type === "common") as ExistingShareholderState[]).map(
      (row) => {
        return {
          name: row.name ?? "",
          shares: row.shares,
          type: 'common',
          commonType: 'shareholder',
        }
      }
    );
    commonStock.push({
      name: "Unused Options Pool",
      shares: unusedOptions,
      type: 'common',
      commonType: 'unusedOptions',
    })
    const results = buildExistingShareholderCapTable(commonStock);
    return results.map((row,idx) => {
      let id = rowData[idx].id || "";
      if (row.commonType === "unusedOptions") {
        id = "UnusedOptionsPool";
      }
      return {
        id,
        name: row.name ?? "",
        shares: row.shares,
        ownershipPct: row.ownershipPct,
        type: "common",
        commonType: row.commonType,
      }
    })
  },
);
