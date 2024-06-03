import { describe, expect, test } from '@jest/globals';
import { SAFE_CONVERSION } from '../index';

describe('converting safe investments with existing common stock', () => {
  test('matches our Google Sheet', () => {
    const preMoneyValuation = 16_700_000
    const common = 9_390_728
    const unusedOptions = 609_272
    const safes: [number, number, number, string][] = [
      [125_000, 125_000 / 0.07, 0, "post"],
      [375_000, 0, 0, "post"],
      [475_000, 10_000_000, 0, "post"],
      [28_500, 13_000_000, 0, "post"],
      [2_997_500, 30_000_000, 0, "post"],
    ]
    const seriesInvestment = 4_000_000

    const expectedValuation = 20_700_000
    const exptectedTotalShares = 20_606_916
    // const exptectedTotalOptions = 2_060_692
    const fit = SAFE_CONVERSION(preMoneyValuation, common, safes, unusedOptions, 0.10, seriesInvestment, false)
    console.log(fit)

    expect(Math.round(fit[4][1] * fit[3][1])).toEqual(expectedValuation)
    expect(Math.round(fit[3][1])).toEqual(exptectedTotalShares)
  });
});