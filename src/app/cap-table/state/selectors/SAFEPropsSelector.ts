import { createSelector } from "reselect";
import {
  getPricedConversion,
  IConversionStateData,
  IRowState,
  SAFEState,
} from "../ConversionState";
import { calcSAFEs } from "@/utils/rowDataHelper";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";
import { OwnershipPctNotes } from "@/components/safe-conversion/Conversion/PricedRound";

// Let's us handler error and things we should bring to the user's attention
// Example: Pre-money ownership for a SAFE is dependent on a priced round, but post-money ownership is not
const determineRowNote = (
  row: IRowState,
  cap: number,
): OwnershipPctNotes | undefined => {
  if (row.type === "safe") {
    const safe = row as SAFEProps;
    if (cap === 0) {
      // Unless with have priced round, we can't calculate an uncapped SAFE
      return {
        error: "TBD",
        explanation: "Uncapped SAFEs are dependent on a priced round to calculate ownership pre-conversion ownership",
      }
    } else if (cap < safe.investment) {
      // We shouldn't allow for this, as it makes no sense
      return {
        error: "Error",
        explanation: "Cap must be greater than investment"
      }
    } else if (safe.conversionType === "pre") {
      // Unless with have priced round, we can't calculate an uncapped SAFE
      return {
        error: "TBD",
        explanation: "Pre-money SAFEs are dependent on a priced round to calculate pre-conversion ownership",
      }
    }
  }
};

const determineRowDisabledFields = (row: SAFEState) => {
  if (row.conversionType === "mfn") return ["cap"]
  if (row.conversionType === "ycmfn") return ["cap", "discount", "investment"]
  if (row.conversionType === "yc7p") return ["cap", "discount", "investment"]
  return []
}


export const getSAFERowPropsSelector = createSelector(
  getPricedConversion,
  (state: IConversionStateData) => state.rowData,
  (pricedConversion, rowData): SAFEProps[] => {
    const rows = rowData.filter((row) => row.type === "safe");

    const safeCalcs = calcSAFEs(rows, pricedConversion);

    return rows.map((row, idx) => {
      const rowResult: SAFEProps = {
        id: row.id,
        type: "safe",
        name: row.name,
        investment: row.investment,
        cap: safeCalcs[idx][0][1],
        discount: row.discount,
        ownership: [
          // This is pre-conversion ownership
          {
            percent: safeCalcs[idx][0][0],
            shares: 0,
            note: determineRowNote(row, safeCalcs[idx][0][1]),
            pps: safeCalcs[idx][0][2],
          },
          // This is the post-conversion ownership after the priced round
          {
            percent: safeCalcs[idx][1][0],
            shares: safeCalcs[idx][1][2],
            pps: safeCalcs[idx][1][3],
          },
        ],
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
