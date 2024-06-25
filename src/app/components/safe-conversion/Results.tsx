import { BestFit } from "@/library/safe_conversion";
import { ConversionState, RowsProps } from "./Conversion";
import { SAFEInputData } from "./SafeNoteList";

interface ResultProps {
  state: ConversionState;
  bestFit: BestFit;
}

const Results: React.FC<ResultProps> = ({ state, bestFit }) => {
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

  return (
    <div>
      {convertedSafes.map((safe, index) => (
        <div key={index}>
          <p>Name: {safe.name}</p>
          <p>Shares: {safe.shares}</p>
          <p>Price per Share: {safe.pps}</p>
          <p>Ownership: {safe.ownership * 100}%</p>
        </div>
      ))}
    </div>
  );
};

export default Results;
