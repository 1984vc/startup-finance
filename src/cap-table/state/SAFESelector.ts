import { createSelector } from "reselect";
import {
  getPricedConversion,
  IConversionStateData,
  IRowState,
} from "./ConversionState";
import { calcSAFEs } from "@/utils/rowDataHelper";
import { SAFEProps } from "@/components/safe-conversion/Conversion/SafeNoteList";

const determineRowError = (
  row: IRowState,
): [error: string | undefined, reason: string | undefined] => {
  if (row.type === "safe") {
    const safe = row as SAFEProps;
    if (safe.cap === 0) {
      // Unless with have priced round, we can't calculate an uncapped SAFE
      return [
        "TBD",
        "Can't estimate ownership of an uncapped SAFE until the priced round",
      ];
    } else if (safe.cap < safe.investment) {
      // We shouldn't allow for this, as it makes no sense
      return ["Error", "Cap must be greater than investment"];
    }
  }
  return [undefined, undefined];
};

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
          // This is a guess at pre-conversion ownership
          {
            percent: safeCalcs[idx][0][0],
            shares: 0,
          },
          // This is the post-conversion ownership
          {
            percent: safeCalcs[idx][1][0],
            shares: safeCalcs[idx][1][2],
          },
        ],
        allowDelete: true,
        disabledFields: row.conversionType === "mfn" ? ["cap"] : [],
        conversionType: row.conversionType,
      };
      const [ownershipError, ownershipErrorReason] = determineRowError(
        rowResult,
      );
      if (ownershipError) {
        rowResult.ownership[0].error = ownershipError;
        rowResult.ownership[0].reason = ownershipErrorReason;
      }
      return {
        ...rowResult,
        ownershipError,
        ownershipErrorReason,
      };
    });
  },
);
