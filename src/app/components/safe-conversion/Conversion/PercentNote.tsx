import ToolipComponent from "@/components/tooltip/Tooltip";
import { CapTableOwnershipError } from "@library/cap-table";

interface PercentNoteProps {
  pct: number;
  note?: string;
  error?: CapTableOwnershipError["type"];
}

const PercentNote: React.FC<PercentNoteProps> = ({ pct, note, error}) => {
  console.log(pct, note, error)
    if (error === "tbd") {
      return (
        <ToolipComponent content={note ?? ""}>
          TBD %
          <sup>*</sup>
        </ToolipComponent>
      );
    } else if (error === "error") {
      return (
        <ToolipComponent content={note ?? ""}>
          Error
          <sup>*</sup>
        </ToolipComponent>
      );
    }
    return pct.toFixed(2) + "%";
}

export default PercentNote;