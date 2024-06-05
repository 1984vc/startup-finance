import { describe, expect, test } from '@jest/globals';
import { fitConversion, ISafeInvestment } from '../safe_conversion';

describe('converting safe investments with existing common stock', () => {
    test('matches our Google Sheet', () => {
        const preMoneyValuation = 16_700_000
        const common = 9_390_728
        const unusedOptions = { name: 'Unused options', amount: 609_272 }
        const safes: ISafeInvestment[] = [
            // YC 7% on $125k is $1,785,714.28571429 cap
            { investment: 125_000, discount: 0, cap: 125_000 / 0.07, type: "post" },
            { investment: 375_000, discount: 0, cap: 0, type: "post" },
            { investment: 475_000, discount: 0, cap: 10_000_000, type: "post" },
            { investment: 28_500, discount: 0, cap: 13_000_000, type: "post" },
            { investment: 2_997_500, discount: 0, cap: 30_000_000, type: "post" },
        ]
        const seriesInvestment = 4_000_000

        const expectedValuation = 20_700_000
        const exptectedTotalShares = 20_606_916
        const exptectedTotalOptions = 2_060_692
        const fit = fitConversion(preMoneyValuation, common, safes, unusedOptions.amount, 0.10, seriesInvestment, { roundDownShares: false, roundPPSPlaces: -1 })
        console.log(fit)

        console.log("Shares:", fit.totalShares, "Valuation:", fit.totalShares * fit.pps)
        expect(Math.round(fit.totalShares * fit.pps)).toEqual(expectedValuation)
        expect(Math.round(fit.totalShares)).toEqual(exptectedTotalShares)
        expect(Math.round(fit.totalOptions)).toEqual(exptectedTotalOptions)
    });
});