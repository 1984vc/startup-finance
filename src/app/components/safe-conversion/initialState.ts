import { ConversionState } from './Conversion';
import { earlyStageInvestors, founders, seriesAInvestors } from './data'
const randomFounders = founders.sort(() => Math.random() - 0.5);
const randomSeed = earlyStageInvestors.sort(() => Math.random() - 0.5);
const randomSeries = seriesAInvestors.sort(() => Math.random() - 0.5);

export const initialState: ConversionState = {
  randomFounders,
  randomSeed,
  randomSeries,
  rowData: [
    {
      id: crypto.randomUUID(),
      type: "common",
      name: `${randomFounders[0]}`,
      shares: 3_000_000,
    },
    {
      id: crypto.randomUUID(),
      type: "common",
      name: `${randomFounders[1]}`,
      shares: 3_000_000,
    },
    {
      id: crypto.randomUUID(),
      type: "common",
      name: `Issued Options`,
      shares: 390_728,
    },
    // YC 7% SAFE
    {
      id: crypto.randomUUID(),
      type: "safe",
      name: "YC 7%",
      investment: 125_000,
      discount: 0,
      cap: 125_000 / 0.07,
      conversionType: "post",
    },
    // Uncapped YC MFN SAFE (Cap to best cap of all safes)
    {
      id: crypto.randomUUID(),
      type: "safe",
      name: "YC MFN",
      investment: 375_000,
      discount: 0,
      cap: 10_000_000,
      conversionType: "post",
    },
    {
      id: crypto.randomUUID(),
      type: "safe",
      name: `${randomSeed[0]}`,
      investment: 475_000,
      discount: 0,
      cap: 10_000_000,
      conversionType: "post",
    },
    {
      id: crypto.randomUUID(),
      type: "safe",
      name: `${randomSeed[1]}`,
      investment: 28_500,
      discount: 0,
      cap: 13_000_000,
      conversionType: "post",
    },
    {
      id: crypto.randomUUID(),
      type: "safe",
      name: `${randomSeed[2]}`,
      investment: 2_997_599,
      discount: 0,
      cap: 30_000_000,
      conversionType: "post",
    },
    {
      id: crypto.randomUUID(),
      type: "series",
      name: `${randomSeries[0]}`,
      investment: 3_000_000,
    },
    {
      id: crypto.randomUUID(),
      type: "series",
      name: `${randomSeries[1]}`,
      investment: 1_000_000,
    },
  ],
  preMoney: 16_700_000,
  targetOptionsPool: 10,
  unusedOptions: 609_272,
};
