import { formatNumberWithCommas } from "@/app/utils/numberFormatting";
import { IConversionState } from "./state/ConversionState";
import { MouseEventHandler, useState } from "react";
import { getResultsPropsSelector } from "./state/ResultSelector";

interface ResultProps {
  state: IConversionState;
}

const Results: React.FC<ResultProps> = ({ state }) => {

  const [investmentChange, setInvestmentChange] = useState(0)
  const [preMoneyChange, setPreMoneyChange] = useState(0)

  const seriesOriginalInvestment = state.rowData.filter((row) => row.type === "series").map((row) => row.investment).reduce((acc, val) => acc + val, 0);

  const results = getResultsPropsSelector({
    ...state,
    preMoneyChange,
    investmentChange
  })

  const pricedConversion = results.pricedConversion

  const increment = (name: "preMoney" | "investment") => {
    console.log(name);
    if (name === "preMoney") {
      const change = preMoneyChange + 500_000;
      setPreMoneyChange(change);
    } else if (name === "investment") {
      const change = investmentChange + 500_000;
      setInvestmentChange(change);
    }
  }

  const decrement = (name: "preMoney" | "investment") => {
      if (name === 'preMoney') {
        const change = preMoneyChange - 500_000;
        if ((state.preMoney - change) > 0) {
          setPreMoneyChange(change);
        }
      } else if (name === 'investment') {
        const change = investmentChange - 500_000;
        if (seriesOriginalInvestment - change > 0) {
          setInvestmentChange(change);
        }
      }
  }

  return (
    <div className="pt-10">
      <h2 className="text-2xl font-bold mb-4">Priced Round Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Post Money
          </dt>
          <dd className="order-first font-semibold tracking-tight text-gray-900">
            <span className="text-2xl p-0 m-0">
              <button className="px-2 mr-2 bg-blue-100 rounded-md" name="increment" onClick={() => decrement('preMoney')}>-</button>
              ${formatNumberWithCommas(results.postMoney)}
              <button className="px-2 ml-2 bg-blue-100 rounded-md" name="increment" onClick={() => increment('preMoney')}>+</button>
            </span>
            <span className="text-sm text-gray-600">
              {preMoneyChange !== 0
                ? ` (${preMoneyChange > 0 ? "+" : ""}$${formatNumberWithCommas(
                    preMoneyChange
                  )})`
                : ""}
            </span>
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Pre Money
          </dt>
          <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">
            <span className="text-2xl p-0 m-0">
              ${formatNumberWithCommas(results.preMoney)}
            </span>
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Investment
          </dt>
          <dd className="order-first font-semibold tracking-tight text-gray-900">
            <span className="text-2xl p-0 m-0">
              <button className="px-2 mr-2 bg-blue-100 rounded-md" name="increment" onClick={() => decrement('investment')}>-</button>
              ${formatNumberWithCommas(results.totalSeriesInvestment)}
              <button className="px-2 ml-2 bg-blue-100 rounded-md" name="increment" onClick={() => increment('investment')}>+</button>
            </span>
            <span className="text-sm text-gray-600">
              {investmentChange !== 0
                ? ` (${
                    investmentChange > 0 ? "+" : ""
                  }$${formatNumberWithCommas(investmentChange)})`
                : ""}
            </span>
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">PPS</dt>
          <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">
            ${pricedConversion.pps}
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Total Shares
          </dt>
          <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">
            {formatNumberWithCommas(pricedConversion.totalShares)}
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Additional Options
          </dt>
          <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">
            {formatNumberWithCommas(pricedConversion.additionalOptions)}
          </dd>
        </div>
      </div>
      <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden w-full mx-auto mt-16">
        <table className="w-full text-sm leading-5">
          <thead className="bg-gray-300 font-bold">
            <tr>
              <th className="py-3 px-4 text-left">Shareholder / Investor</th>
              <th className="py-3 px-4 text-left">Investment</th>
              <th className="py-3 px-4 text-left">Shares</th>
              <th className="py-3 px-4 text-right">Ownership %</th>
              <th className="py-3 px-4 text-right">Change %</th>
            </tr>
          </thead>
          <tbody>
            {results.shareholders.map((shareholder, idx) => (
              <tr key={`shareholder-${idx}`}>
                <td className="py-3 px-4 text-left font-medium text-gray-600">
                  {shareholder.name}
                </td>
                <td className="py-3 px-4 text-left">
                  {shareholder.investment ? "$" + formatNumberWithCommas(shareholder.investment) : ""}
                </td>
                <td className="py-3 px-4 text-left">
                  {shareholder.shares
                    ? formatNumberWithCommas(shareholder.shares)
                    : ""}
                </td>
                <td className="py-3 px-4 text-right">
                  {shareholder.ownershipPct.toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right">
                  {shareholder.ownershipChange.toFixed(2)}%
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">
                Refreshed Options Pool
              </td>
              <td className="py-3 px-4 text-left"></td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(results.pricedConversion.totalOptions)}
              </td>
              <td className="py-3 px-4 text-right">
                {(
                  100 *
                  (results.pricedConversion.totalOptions / results.totalShares)
                ).toFixed(2)}
                %
              </td>
              <td className="py-3 px-4 text-right"></td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td className="py-3 px-4 text-left">Total</td>
              <td className="py-3 px-4 text-left">
                ${formatNumberWithCommas(results.totalInvestedToDate)}
              </td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(results.totalShares)}
              </td>
              <td className="py-3 px-4 text-right">
                {results.totalPct.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;
