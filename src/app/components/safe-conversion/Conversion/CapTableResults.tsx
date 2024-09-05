import { formatNumberWithCommas } from "@library/utils/numberFormatting";
import { CapTableRow, TotalCapTableRow } from "@library/cap-table";

export type CapTableProps = {
  rows: CapTableRow[];
  changes: number[];
  totalRow: TotalCapTableRow;
} 

type CapTableRowItemProps = {
  shareholder: CapTableRow;
  change?: number
  ownershipError?: string;
  ownershipNotes?: string;
}

const roundTo = (num: number, decimal: number): number => {
  return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
};

const CapTableRowItem: React.FC<CapTableRowItemProps> = ({shareholder, change }) => {
  const investment = (shareholder.type === "safe" || shareholder.type === "series") ? shareholder.investment : null
  const pps = (shareholder.type === "safe" || shareholder.type === "series") ? shareholder.pps : null

  const hasChanges = change !== undefined
  const changePct = roundTo((change ?? 0) * 100, 2)
  let ownershipPct: string | undefined = shareholder.ownershipPct?.toFixed(2) + "%"
  if (shareholder.ownershipError) {
    if (shareholder.ownershipError.type === 'error') {
      ownershipPct = "Error"
    } else if (shareholder.ownershipError.type === 'tbd') {
      ownershipPct = "TBD"
    }
  }

  return (
    <tr className="">
      <td className="py-3 px-2 pb-1 text-left border-b border-gray-300 dark:border-gray-700">
        {shareholder.name}
      </td>
      <td className="py-3 px-2 w-2 border-none"></td>
      <td className="py-3 px-4 pb-1 text-left border-b border-gray-300 dark:border-gray-700">
        {investment
          ? "$" + formatNumberWithCommas(investment)
          : ""}
      </td>
      <td className="py-3 px-2 w-2 border-none"></td>
      <td className="py-3 px-4 pb-1 text-left border-b border-gray-300 dark:border-gray-700">
        {
          pps
            ? "$" + formatNumberWithCommas(pps)
            : ""
        }
      </td>
      <td className="py-3 px-2 w-2 border-none"></td>
      <td className="py-3 px-4 pb-1 text-left border-b border-gray-300 dark:border-gray-700">
        {
          shareholder.shares
            ? formatNumberWithCommas(shareholder.shares)
            : ""
        }
      </td>
      <td className="py-3 px-2 w-2 border-none"></td>
      <td className="py-3 px-4 pb-1 text-left border-b border-gray-300 dark:border-gray-700">
        <div className="grid grid-cols-2 justify-items-start">
          <span className="">
          {ownershipPct}
          </span>
          {hasChanges && (
            <span
              className={`pl-2 text-right ${changePct > 0 ? "text-green-500" : changePct < 0 ? "text-red-500" : "text-black"}`}
            >
              {changePct > 0 ? "+" : ""}{changePct}%
            </span>
          )}
        </div>
      </td>
    </tr>

  )

}

export const CapTableResults: React.FC<CapTableProps> = (props) => {
  const {
    rows,
    changes,
    totalRow,
  } = props


  const hasChanges = changes.length > 0

  return (
    <div>
      <div className="overflow-hidden w-full mx-auto mt-2">
        <table className="w-full text-sm border-seperate border-spacing-2">
          <thead className="bg-inherit">
            <tr className="text-gray-500">
              <th className="py-3 px-2 text-left font-thin">Shareholder / Investor</th>
              <th className="py-3 px-2 w-2 border-none"></th>
              <th className="py-3 px-4 text-left font-thin">Investment</th>
              <th className="py-3 px-2 w-2 border-none"></th>
              <th className="py-3 px-4 text-left font-thin">PPS</th>
              <th className="py-3 px-2 w-2 border-none"></th>
              <th className="py-3 px-4 text-left font-thin">Shares</th>
              <th className="py-3 px-2 w-2 border-none"></th>
              <th className="py-3 px-4 text-left font-thin">Ownership %</th>
            </tr>
          </thead>
          <tbody className="not-prose font-bold">
            {rows.map((shareholder, idx) => (
              <CapTableRowItem
                key={`captablerow-${idx}`}
                shareholder={shareholder}
                change={changes[idx]}
              />
            ))}
            <tr className="h-4">
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
              <td className="py-0 px-0"></td>
            </tr>
            <tr className="font-bold bg-inherit border-2 border-gray-700 dark:border-gray-300">
              <td className="py-3 px-4 text-left">Total</td>
              <td className="py-3 px-2 w-2 border-none"></td>              
              <td className="py-3 px-4 text-left">
                ${formatNumberWithCommas(totalRow.investment)}
              </td>
              <td className="py-3 px-2 w-2 border-none"></td>              
              <td className="py-3 px-4 text-left">
              </td>
              <td className="py-3 px-2 w-2 border-none"></td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(totalRow.shares ?? 0)}
              </td>
              <td className="py-3 px-2 w-2 border-none"></td>
              <td className="py-3 px-4 text-left">
                {(totalRow.ownershipPct * 100).toFixed(2) + "%"}
              </td>
              {hasChanges && <td className="py-3 px-4 text-left"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
