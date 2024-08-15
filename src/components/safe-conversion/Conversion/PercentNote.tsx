import ToolipComponent from "@/components/tooltip/Tooltip";
import { OwnershipPctNotes } from "./PricedRound";

interface PercentNoteProps {
  pct: number;
  note?: OwnershipPctNotes;
}

const PercentNote: React.FC<PercentNoteProps> = ({ pct, note }) => {
    if (note && note.error === "TBD") {
      return (
        <ToolipComponent content={note.explanation ?? ""}>
          {pct.toFixed(2)}%
          <sup>*</sup>
        </ToolipComponent>
      );
    } else if (note && note.error === "Error") {
      return (
        <ToolipComponent content={note.explanation ?? ""}>
          Error
          <sup>*</sup>
        </ToolipComponent>
      );
    }
    return pct.toFixed(2) + "%";
}

export default PercentNote;