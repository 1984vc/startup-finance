import { createSelector } from "reselect";
import { getPricedConversion, IConversionStateData } from "./ConversionState";
import { SeriesProps } from "@/app/components/safe-conversion/Conversion/SeriesInvestorList";

export const getSeriesPropsSelector = createSelector(
  getPricedConversion,
  (state: IConversionStateData) => state.rowData,
  (pricedConversion, rowData): SeriesProps[] => {
    const rows = rowData.filter((row) => row.type === "series");
    const seriesOwnershipPct = rows.map((data) => {
      if (!pricedConversion) return [0, 0];
      const shares = Math.floor(data.investment / pricedConversion.pps);
      return [shares, (shares / pricedConversion.totalShares) * 100];
    });

    return rows.map((row, idx) => {
      return {
        id: row.id,
        type: "series",
        name: row.name,
        investment: row.investment,
        shares: seriesOwnershipPct[idx][0] ?? 0,
        ownershipPct: seriesOwnershipPct[idx][1] ?? 0,
        allowDelete: rows.length > 1,
      };
    });
  },
);
