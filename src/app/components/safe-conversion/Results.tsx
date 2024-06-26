import { BestFit } from "@/library/safe_conversion";
import { ConversionState, RowsProps } from "./Conversion";
import { SAFEInputData } from "./SafeNoteList";
import { CommonStockInputData } from "./CommonStockList";
import { SeriesInputData } from "./SeriesInvestmentList";

interface ResultProps {
  state: ConversionState;
  bestFit: BestFit;
}

const Results: React.FC<ResultProps> = ({ state, bestFit }) => {
  const commonShareholders = (
    state.rowData.filter((r) => r.type === "common") as CommonStockInputData[]
  ).map((r) => {
    return {
      name: r.name,
      shares: r.shares,
      ownership: r.shares / bestFit.totalShares,
    };
  });

  const convertedSafes = (
    state.rowData.filter((r) => r.type === "safe") as SAFEInputData[]
  ).map((r, idx) => {
    const pps = bestFit.ppss[idx];
    const shares = r.investment / pps;
    return {
      name: r.name,
      shares,
      pps,
      ownership: shares / bestFit.totalShares,
    };
  });

  const seriesShareholders = (
    state.rowData.filter((r) => r.type === "series") as SeriesInputData[]
  ).map((r) => {
    const shares = r.investment / bestFit.pps;
    return {
      name: r.name,
      shares,
      ownership: shares / bestFit.totalShares,
    };
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-4">Common</h3>
        {commonShareholders.map((common, index) => (
          <div
            key={index}
            className="flex flex-row items-center space-x-4 bg-gray-100 p-4 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold">Name: {common.name}</p>
            </div>
            <div className="flex-1">
              <p>Shares: {common.shares.toFixed(2)}</p>
            </div>
            <div className="flex-1">
              <p>Ownership: {(common.ownership * 100).toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-4">SAFE Investors</h3>
        {convertedSafes.map((safe, index) => (
          <div
            key={index}
            className="flex flex-row items-center space-x-4 bg-gray-100 p-4 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold">Name: {safe.name}</p>
            </div>
            <div className="flex-1">
              <p>Shares: {safe.shares.toFixed(2)}</p>
            </div>
            <div className="flex-1">
              <p>Price per Share: ${safe.pps.toFixed(2)}</p>
            </div>
            <div className="flex-1">
              <p>Ownership: {(safe.ownership * 100).toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-4">Series Investors</h3>
        {seriesShareholders.map((investor, index) => (
          <div
            key={index}
            className="flex flex-row items-center space-x-4 bg-gray-100 p-4 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold">Name: {investor.name}</p>
            </div>
            <div className="flex-1">
              <p>Shares: {investor.shares.toFixed(2)}</p>
            </div>
            <div className="flex-1">
              <p>Ownership: {(investor.ownership * 100).toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
