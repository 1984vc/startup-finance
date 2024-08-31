import { createSelector } from "reselect";
import {
  IConversionStateData,
  SAFEState,
} from "../ConversionState";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";
import { getPreRoundCapTable } from "./PreRoundCapTableSelector";

const determineRowDisabledFields = (row: SAFEState) => {
  if (row.conversionType === "mfn") return ["cap"]
  if (row.conversionType === "ycmfn") return ["cap"]
  return []
}


export const getSAFERowPropsSelector = createSelector(
  getPreRoundCapTable,
  (state: IConversionStateData) => state.rowData,
  (preRoundCapTable, rowData): SAFEProps[] => {
    const rows = rowData.filter((row) => row.type === "safe");
    console.log(preRoundCapTable.rows)
    const safeCapTable = preRoundCapTable.rows.filter((row) => row.type === "safe");

    return rows.map((row, idx) => {
      const rowResult: SAFEProps = {
        id: row.id,
        type: "safe",
        name: row.name,
        investment: row.investment,
        cap: safeCapTable[idx].cap ?? row.cap,
        discount: row.discount,
        shares: 0,
        ownershipPct: safeCapTable[idx].ownershipPct,
        ownershipError: safeCapTable[idx].ownershipError,
        ownershipNotes: safeCapTable[idx].ownershipNotes,
        allowDelete: true,
        disabledFields: determineRowDisabledFields(row),
        conversionType: row.conversionType
      };
      return {
        ...rowResult,
      };
    });
  },
);
