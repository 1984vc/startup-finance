import { formatNumberWithCommas } from "@/utils/numberFormatting";
import { BestFit } from "@/library/safe_conversion";

export interface CapTableRow {
  name: string;
  shares?: number;
  investment?: number;
  ownershipPct: number;
  ownershipChange?: number;
  error?: boolean
}

export type CapTableProps = {
    pricedConversion?: BestFit,
    totalShares: number,
    totalPct: number,
    totalInvestedToDate: number,
    capTable: CapTableRow[],
} 

export const CapTableResults: React.FC<CapTableProps> = (props) => {
  const {
    totalShares,
    totalPct,
    totalInvestedToDate,
    capTable
  } = props

  const roundTo = (num: number, decimal: number): number => {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
  };

  const hasChanges = capTable.some(
    (shareholder) => shareholder.ownershipChange !== 0,
  );
  const ownershipError = capTable.find(
    (shareholder) => shareholder.error
  ) !== undefined;

  return (
    <div>
      <div className="overflow-hidden w-full mx-auto mt-2">
        <table className="w-full text-sm border-seperate border-spacing-2">
          <thead className="bg-inherit">
            <tr className="text-gray-500">
              <th className="py-3 px-4 text-left font-thin">Shareholder / Investor</th>
              <th className="py-3 px-4 text-left font-thin">Investment</th>
              <th className="py-3 px-4 text-left font-thin">Shares</th>
              <th className="py-3 px-4 text-left font-thin">Ownership %</th>
              {hasChanges && <th className="py-3 px-4 text-left font-thin">Change %</th>}
            </tr>
          </thead>
          <tbody className="not-prose font-bold">
            {capTable.map((shareholder, idx) => (
              <tr className="" key={`shareholder-${idx}`}>
                <td className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-700">
                  {shareholder.name}
                </td>
                <td className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-700">
                  {shareholder.investment
                    ? "$" + formatNumberWithCommas(shareholder.investment)
                    : ""}
                </td>
                <td className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-700">
                  {ownershipError
                    ? "Error"
                    : shareholder.shares
                      ? formatNumberWithCommas(shareholder.shares)
                      : ""
                  }
                </td>
                <td className="py-3 px-4 text-left border-b border-gray-300 dark:border-gray-700">
                  {ownershipError
                    ? "Error"
                    : shareholder.ownershipPct.toFixed(2) + "%"}
                </td>
                {hasChanges && (
                  <td
                    className={`py-3 px-4 text-left border-b border-gray-300 dark:border-gray-700 ${roundTo(shareholder.ownershipChange ?? 0, 2) > 0 ? "text-green-500" : roundTo(shareholder.ownershipChange ?? 0, 2) < 0 ? "text-red-500" : "text-black"}`}
                  >
                    {roundTo(shareholder.ownershipChange ?? 0, 2).toFixed(2)}
                  </td>
                )}
              </tr>
            ))}
            <tr className="font-bold bg-inherit border-2 border-gray-300">
              <td className="py-3 px-4 text-left">Total</td>
              <td className="py-3 px-4 text-left">
                ${formatNumberWithCommas(totalInvestedToDate)}
              </td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(totalShares)}
              </td>
              <td className="py-3 px-4 text-left">
                {ownershipError ? "Error" : totalPct.toFixed(2) + "%"}
              </td>
              {hasChanges && <td className="py-3 px-4 text-left"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
