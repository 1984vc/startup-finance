import { createSelector } from "reselect";
import { ExistingShareholderState, IConversionStateData, SAFEState } from "../ConversionState";
import { CommonStockholder, SAFENote, buildPreRoundCapTable } from "@library/cap-table";
import { CapTableProps } from "@/components/safe-conversion/Conversion/CapTableResults";

// The initial shares of the existing shareholders
export const getPreRoundCapTable = createSelector(
  (state: IConversionStateData) => state.rowData,
  (state: IConversionStateData) => state.unusedOptions,
  (
    rowData,
    unusedOptions
  ): CapTableProps => {
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

    const safeNotes: SAFENote[] = (rowData.filter((row) => row.type === "safe") as SAFEState[]).map(
      (row) => {
        const conversionType = row.conversionType === "mfn" ? "post" : row.conversionType === 'post' ? "post" : "pre";
        return {
          name: row.name ?? "",
          investment: row.investment,
          cap: row.cap ?? 0,
          discount: row.discount ?? 0,
          conversionType,
          sideLetters: row.conversionType === "mfn" ? ["mfn"] : [],
          type: 'safe',
        }
      }
    );
    const {common, safes, total} = buildPreRoundCapTable([...commonStock, ...safeNotes]);
    return {
      totalRow: total,
      changes: [],
      rows: [...common, ...safes].map((row) => {
        if (row.type === 'safe') {
          return {
            name: row.name ?? "",
            shares: row.shares,
            investment: row.investment,
            pps: 0,
            discount: row.discount,
            cap: row.cap,
            type: row.type,
            ownershipPct: (row.ownershipPct ?? 0) * 100,
            ownershipError: row.type === 'safe' ? row.ownershipError : undefined,
            ownershipErrorReason: row.type === 'safe' ? row.ownershipNotes : undefined,
          }
        }
        return {
          name: row.name ?? "",
          shares: row.shares,
          type: row.type,
          ownershipPct: (row.ownershipPct ?? 0) * 100,
        }
      })
    }
  },
);