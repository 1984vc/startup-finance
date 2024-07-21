import { BestFit } from "@/library/safe_conversion";
import { ConversionState, RowsProps } from "./Conversion";
import { SAFERowData } from "./SafeNoteList";
import { ExistingShareholderData } from "./ExistingShareholders";
import { SeriesRowData } from "./SeriesInvestmentList";
import { formatNumberWithCommas } from "@/app/utils/numberFormatting";

interface ResultProps {
  state: ConversionState;
  pricedConversion: BestFit;
}

const Results: React.FC<ResultProps> = ({ state, pricedConversion }) => {
  const commonShareholders = (
    state.rowData.filter((r) => r.type === "common") as ExistingShareholderData[]
  ).map((r) => {
    return {
      name: r.name,
      shares: r.shares,
      ownership: r.shares / pricedConversion.totalShares,
    };
  });

  const convertedSafes = (
    state.rowData.filter((r) => r.type === "safe") as SAFERowData[]
  ).map((r, idx) => {
    const pps = pricedConversion.ppss[idx];
    const shares = r.investment / pps;
    return {
      name: r.name,
      shares,
      pps,
      ownership: shares / pricedConversion.totalShares,
    };
  });

  const seriesShareholders = (
    state.rowData.filter((r) => r.type === "series") as SeriesRowData[]
  ).map((r) => {
    const shares = r.investment / pricedConversion.pps;
    return {
      name: r.name,
      shares,
      ownership: shares / pricedConversion.totalShares,
    };
  });

  return (
    <div className="pt-10">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="space-y-4">
        <div className="flex flex-row items-center space-x-4 bg-gray-100 p-4 rounded-lg">
          <div className="flex-1">
            <p>PPS: ${pricedConversion.pps}</p>
          </div>
          <div className="flex-1">
            <p>TotalShares: {formatNumberWithCommas(pricedConversion.totalShares)}</p>
          </div>
          <div className="flex-1">
            <p>
              Additional Options:{" "}
              {formatNumberWithCommas(pricedConversion.additionalOptions)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
