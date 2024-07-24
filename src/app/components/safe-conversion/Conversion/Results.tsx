import { BestFit, fitConversion } from "@/library/safe_conversion";
import { formatNumberWithCommas, stringToNumber } from "@/app/utils/numberFormatting";
import { ExistingShareholderProps, ExistingShareholderState, IConversionState, SAFEProps, SAFEState, SeriesProps, SeriesState } from "./state/ConversionState";

interface ResultProps {
  state: IConversionState;
  pricedConversion: BestFit;
}

// Should round a number up to the nearest multiple 10**nearest
// EG. 1234, 2 => 1300
const roundUpToNearest = (n: number, nearest: number) => {
  const multiplier = Math.pow(10, nearest);
  return Math.ceil(n / multiplier) * multiplier;
}

const getTrialPricedConversion = (preMoney: number, state: IConversionState): BestFit => {
    const commonStock = (
      state.rowData.filter(
        (row) => row.type === "common"
      ) as ExistingShareholderProps[]
    )
      .map((row) => row.shares)
      .reduce((acc, val) => acc + val, 0);

    const totalShares = commonStock;
    const pricedConversion = fitConversion(
      stringToNumber(preMoney),
      totalShares,
      (state.rowData.filter((row) => row.type === "safe") as SAFEProps[]).map(
        (row) => {
          return {
            investment: stringToNumber(row.investment),
            cap: stringToNumber(row.cap),
            discount: stringToNumber(row.discount) / 100,
            conversionType: row.conversionType,
          };
        }
      ),
      stringToNumber(state.unusedOptions),
      stringToNumber(state.targetOptionsPool) / 100,
      (state.rowData.filter((row) => row.type === "series") as SeriesProps[]).map(
        (row) => row.investment
      ),
      { roundDownShares: true, roundPPSPlaces: 5 }
    );
    return pricedConversion;

}

const Results: React.FC<ResultProps> = ({ state, pricedConversion }) => {
  const commonShareholders = (
    state.rowData.filter((r) => r.type === "common") as ExistingShareholderState[]
  ).map((r) => {
    return {
      name: r.name,
      shares: r.shares,
      ownership: r.shares / pricedConversion.totalShares,
    };
  });

  const preMoneyOrderOfMagnitude = Math.floor(Math.log10(state.preMoney));
  const roundUpToNearestAmount = preMoneyOrderOfMagnitude - 2 < 0 ? 0 : preMoneyOrderOfMagnitude - 2;

  const trialPreMoneyValuationsFactor = [0.75, 1.25, 1.5];
  const trialPreMoneyValuations = trialPreMoneyValuationsFactor.map((factor) => {
    return roundUpToNearest(state.preMoney * factor, roundUpToNearestAmount);
  });

  const trialCommonShareholders = trialPreMoneyValuations.map((preMoney) => {
    const trialPricedConversion = getTrialPricedConversion(preMoney, state);
    return (state.rowData.filter((r) => r.type === "common") as ExistingShareholderState[]).map((r) => {
      return {
        name: r.name,
        shares: r.shares,
        ownership: r.shares / trialPricedConversion.totalShares,
      };
    })
  })

  return (
    <div className="pt-10">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="space-y-4">
        <div className="flex flex-row items-center space-x-4 bg-gray-100 p-4 rounded-lg">
          <div className="flex-1">
            <p>PPS: ${pricedConversion.pps}</p>
          </div>
          <div className="flex-1">
            <p>
              TotalShares:{" "}
              {formatNumberWithCommas(pricedConversion.totalShares)}
            </p>
          </div>
          <div className="flex-1">
            <p>
              Additional Options:{" "}
              {formatNumberWithCommas(pricedConversion.additionalOptions)}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2>Shareholders</h2>
        {commonShareholders.map((shareholder) => (
          <div key={shareholder.name}>
            <p>
              Name: {shareholder.name} : {(shareholder.ownership * 100).toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-xl">Trial Priced Rounds</h2>
      <div className="flex items-center space-x-4 mb-4">
        {trialCommonShareholders.map((trialPricedRound, idx) => (
          <div key={idx + "" + "premoneytrial"} className="w-96">
            <h2>Pre-Money: ${formatNumberWithCommas(trialPreMoneyValuations[idx])}</h2>
            {trialPricedRound.map((shareholder) => (
              <div key={shareholder.name}>
                <div className="w-64">{shareholder.name} - {(shareholder.ownership * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
