import { formatNumberWithCommas } from "@/app/utils/numberFormatting";
import { IConversionState } from "./state/ConversionState";
import { useState } from "react";
import { getResultsPropsSelector } from "./state/ResultSelector";

interface ResultProps {
  state: IConversionState;
}

const Results: React.FC<ResultProps> = ({ state }) => {

  const sliderChange = (sliderVal: number) => {
    return (sliderVal - 20) * 500_000;
  }

  const [investmentSlider, setInvestmentSlider] = useState(20)
  const investmentChange = sliderChange(investmentSlider)

  const [postMoneySlider, setPreMoneySlider] = useState(20)
  const preMoneyChange = sliderChange(postMoneySlider);

  const seriesOriginalInvestment = state.rowData.filter((row) => row.type === "series").map((row) => row.investment).reduce((acc, val) => acc + val, 0);

  const results = getResultsPropsSelector({
    ...state,
    preMoneyChange,
    investmentChange
  })

  const pricedConversion = results.pricedConversion
  
  const updateSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target?.value
      if (!e.target) {
        return
      }
      if (e.target.name === 'preMoneySlider') {
        const preMoneySlider = parseInt(e.target?.value ?? 0, 10);
        const change = sliderChange(preMoneySlider);
        if ((state.preMoney - change) > 0) {
          setPreMoneySlider(preMoneySlider);
        }
      } else if (e.target.name === 'investmentSlider') {
        const investmentSlider = parseInt(e.target?.value ?? 0, 10);
        const change = sliderChange(investmentSlider);
        if (seriesOriginalInvestment + change > 0) {
          setInvestmentSlider(investmentSlider);
        }
      }
  }

  return (
    <div className="pt-10">
      <h2 className="text-2xl font-bold mb-4">Priced Round Overview</h2>
      <div className="flex flex-row space-x-8">
        <div className="bg-white rounded-lg shadow-lg p-4 flex-1">
          <h2 className="text-2xl font-bold mb-4">Post Money</h2>
          <label className="block text-gray-700 font-bold mb-2">
              ${formatNumberWithCommas(results.postMoney)}
              { preMoneyChange !== 0 ? ` (${preMoneyChange > 0 ? "+" : ""}$${formatNumberWithCommas(preMoneyChange)})` : "" }
          </label>
          <div className="mb-4">
            <input
              id="range"
              type="range"
              name="preMoneySlider"
              value={postMoneySlider}
              min={0}
              max={40}
              step={1}
              onChange={updateSlider}
              className="block w-full py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 flex-1">
          <h2 className="text-2xl font-bold mb-4">Investment</h2>
          <label className="block text-gray-700 font-bold mb-2">
            ${formatNumberWithCommas(results.totalSeriesInvestment)}
            { investmentChange !== 0 ? ` (${investmentChange > 0 ? "+" : ""}$${formatNumberWithCommas(investmentChange)})` : "" }
          </label>
          <div className="mb-4">
            <input
              id="range"
              type="range"
              name="investmentSlider"
              value={investmentSlider}
              min={0}
              max={40}
              step={1}
              onChange={updateSlider}
              className="block w-full py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
        </div>

      </div>
      <h2 className="text-xl font-bold mb-4 mt-8">Round Details</h2>
      <h3 className="text-l font-bold mb-4 mt-8">${formatNumberWithCommas(results.totalSeriesInvestment)} on ${formatNumberWithCommas(results.postMoney)} at a pre-money of ${formatNumberWithCommas(results.preMoney)}</h3>
      <p>PPS: ${pricedConversion.pps}</p>
      <p> TotalShares:{" "}
        {formatNumberWithCommas(pricedConversion.totalShares)}
      </p>
      <p>
        Additional Options:{" "}
        {formatNumberWithCommas(pricedConversion.additionalOptions)}
      </p>
      <p>
        Total Options after conversion:{" "}
        {formatNumberWithCommas(pricedConversion.totalOptions)}
      </p>
      <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden w-full mx-auto mt-16">
        <table className="w-full text-sm leading-5">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-600">
                Shareholder / Investor
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">
                Investment
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">
                Shares
              </th>
              <th className="py-3 px-4 text-right font-medium text-gray-600">
                Ownership %
              </th>
            </tr>
          </thead>
          <tbody>
            {results.existingShareholders.map((shareholder, idx) => (
              <tr key={`shareholder-${idx}`}>
                <td className="py-3 px-4 text-left font-medium text-gray-600">
                  {shareholder.name}
                </td>
                <td className="py-3 px-4 text-left">
                </td>
                <td className="py-3 px-4 text-left">
                  {formatNumberWithCommas(shareholder.shares)}
                </td>
                <td className="py-3 px-4 text-right">
                  {shareholder.dilutedPct.toFixed(2)}%
                </td>
              </tr>
            ))}
            {results.safeInvestors.map((investor, idx) => (
              <tr key={`safeinvestorresult-${idx}`}>
                <td className="py-3 px-4 text-left font-medium text-gray-600">
                  {investor.name}
                </td>
                <td className="py-3 px-4 text-left">
                  ${formatNumberWithCommas(investor.investment ?? 0)}
                </td>
                <td className="py-3 px-4 text-left">
                  {formatNumberWithCommas(investor.shares ?? 0)}
                </td>
                <td className="py-3 px-4 text-right">
                  {investor.ownershipPct.toFixed(2)}%
                </td>
              </tr>
            ))}
            {results.seriesInvestors.map((investor, idx) => (
              <tr key={`seriesinvestorresult-${idx}`}>
                <td className="py-3 px-4 text-left font-medium text-gray-600">
                  {investor.name}
                </td>
                <td className="py-3 px-4 text-left">
                  ${formatNumberWithCommas(investor.investment ?? 0)}
                </td>
                <td className="py-3 px-4 text-left">
                  {formatNumberWithCommas(investor.shares)}
                </td>
                <td className="py-3 px-4 text-right">
                  {investor.ownershipPct.toFixed(2)}%
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">
                Refreshed Options Pool
              </td>
              <td className="py-3 px-4 text-left">
              </td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(pricedConversion.totalOptions)}
              </td>
              <td className="py-3 px-4 text-right">
                {(100 * (pricedConversion.totalOptions / results.totalShares)).toFixed(
                  2
                )}
                %
              </td>
            </tr>
            <tr className="font-bold">
              <td className="py-3 px-4 text-left">Total</td>
              <td className="py-3 px-4 text-left">${ formatNumberWithCommas(results.totalInvestedToDate) }</td>
              <td className="py-3 px-4 text-left">
                {formatNumberWithCommas(results.totalShares)}
              </td>
              <td className="py-3 px-4 text-right">{results.totalPct.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;
