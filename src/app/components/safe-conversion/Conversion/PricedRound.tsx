import { formatNumberWithCommas } from "@/utils/numberFormatting";
import { BestFit } from "@/library/safe_conversion";

export interface ShareholderRow {
  name: string;
  shares?: number;
  investment?: number;
  ownershipPct: number;
  ownershipChange: number;
  ownershipError?: string;
}

export interface PricedRoundPropsData {
  preMoney: number;
  postMoney: number;
  shareholders: ShareholderRow[];
  totalSeriesInvestment: number;
  totalShares: number;
  totalPct: number;
  totalInvestedToDate: number;
  pricedConversion: BestFit;
  preMoneyChange: number;
  investmentChange: number;
}

export interface PricedRoundProps extends PricedRoundPropsData {
  updateInvestmentChange: (change: number) => void;
  updatePreMoneyChange: (change: number) => void;
}

const PricedRound: React.FC<PricedRoundProps> = (props) => {
  const {
    preMoney,
    pricedConversion,
    postMoney,
    totalShares,
    totalSeriesInvestment,
    totalPct,
    totalInvestedToDate,
    shareholders,
    preMoneyChange,
    investmentChange,
    updateInvestmentChange,
    updatePreMoneyChange,
  } = props;

  const roundTo = (num: number, decimal: number): number => {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
  };

  const increment = (name: "preMoney" | "investment") => {
    console.log(name);
    if (name === "preMoney") {
      const change = preMoneyChange + 500_000;
      updatePreMoneyChange(change);
    } else if (name === "investment") {
      const change = investmentChange + 500_000;
      updateInvestmentChange(change);
    }
  };

  const decrement = (name: "preMoney" | "investment") => {
    if (name === "preMoney") {
      const change = preMoneyChange - 500_000;
      if (preMoney - change > 0) {
        updatePreMoneyChange(change);
      }
    } else if (name === "investment") {
      const change = investmentChange - 500_000;
      if (totalSeriesInvestment - change > 0) {
        updateInvestmentChange(change);
      }
    }
  };

  return (
    <div className="pt-10">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Post Money
          </dt>
          <dd className="order-first font-semibold tracking-tight text-gray-900">
            <span className="text-2xl p-0 m-0">
              <button
                className="px-2 mr-2 bg-blue-100 rounded-md"
                name="increment"
                onClick={() => decrement("preMoney")}
              >
                -
              </button>
              ${formatNumberWithCommas(postMoney)}
              <button
                className="px-2 ml-2 bg-blue-100 rounded-md"
                name="increment"
                onClick={() => increment("preMoney")}
              >
                +
              </button>
            </span>
            <span className="text-sm text-gray-600">
              {preMoneyChange !== 0
                ? ` (${preMoneyChange > 0 ? "+" : ""}$${formatNumberWithCommas(
                    preMoneyChange,
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
              ${formatNumberWithCommas(preMoney)}
            </span>
          </dd>
        </div>
        <div className="flex flex-col bg-gray-100 p-8 text-center rounded-lg">
          <dt className="text-sm font-semibold leading-6 text-gray-600">
            Investment
          </dt>
          <dd className="order-first font-semibold tracking-tight text-gray-900">
            <span className="text-2xl p-0 m-0">
              <button
                className="px-2 mr-2 bg-blue-100 rounded-md"
                name="increment"
                onClick={() => decrement("investment")}
              >
                -
              </button>
              ${formatNumberWithCommas(totalSeriesInvestment)}
              <button
                className="px-2 ml-2 bg-blue-100 rounded-md"
                name="increment"
                onClick={() => increment("investment")}
              >
                +
              </button>
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
    </div>
  );
};

export default PricedRound;
