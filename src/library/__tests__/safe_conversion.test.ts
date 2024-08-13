import { describe, expect, test } from "@jest/globals";
import { fitConversion, ISafeInvestment } from "@/library/safe_conversion";

describe("converting safe investments with existing common stock", () => {
  test("Sanity check our baseline", () => {
    const preMoneyValuation = 32_000_000;
    const common = 2_000_000;
    const unusedOptions = { name: "Unused options", amount: 0 };
    const safes: ISafeInvestment[] = [
      {
        investment: 2_000_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
    ];
    const seriesInvestments = [8_000_000];

    const expectedValuation = 40_000_000;
    const expectedTotalShares = 3_125_000;
    const expectedPPS = 12.8;
    const exptectedTotalOptions = 0;
    const fit = fitConversion(
      preMoneyValuation,
      common,
      safes,
      unusedOptions.amount,
      0.0,
      seriesInvestments,
      { roundShares: true, roundPPSPlaces: 8},
    );

    expect(fit.totalShares).toEqual(expectedTotalShares);
    expect(fit.totalShares * fit.pps).toEqual(expectedValuation);
    expect(fit.totalOptions).toEqual(exptectedTotalOptions);
    expect(fit.totalShares).toEqual(expectedTotalShares);
    expect(fit.pps).toEqual(expectedPPS);
  });
  test("matches our Google Sheet", () => {
    const preMoneyValuation = 16_700_000;
    const common = 9_390_728;
    const unusedOptions = { name: "Unused options", amount: 609_272 };
    const safes: ISafeInvestment[] = [
      // YC 7% on $125k is $1,785,714.28571429 cap
      {
        investment: 125_000,
        discount: 0,
        cap: 125_000 / 0.07,
        conversionType: "post",
      },
      { investment: 375_000, discount: 0, cap: 0, conversionType: "post" },
      {
        investment: 475_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 28_500,
        discount: 0,
        cap: 13_000_000,
        conversionType: "post",
      },
      {
        investment: 2_997_500,
        discount: 0,
        cap: 30_000_000,
        conversionType: "post",
      },
    ];
    const seriesInvestments = [4_000_000];

    const expectedValuation = 20_700_000;
    const exptectedTotalShares = 20_606_916;
    const exptectedTotalOptions = 2_060_692;
    const fit = fitConversion(
      preMoneyValuation,
      common,
      safes,
      unusedOptions.amount,
      0.1,
      seriesInvestments,
      { roundPPSPlaces: -1 },
    );

    expect(Math.round(fit.totalShares * fit.pps)).toEqual(expectedValuation);
    expect(Math.round(fit.totalShares)).toEqual(exptectedTotalShares);
    expect(Math.round(fit.totalOptions)).toEqual(exptectedTotalOptions);
  });
  test("matches our known truth", () => {
    const preMoneyValuation = 49_800_000;
    const common = 10_000_000 + 1_694_118;
    const unusedOptions = 0;
    const safes: ISafeInvestment[] = [
      {
        investment: 50_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 1_000_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 25_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 175_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 150_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 50_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 5_000,
        discount: 0,
        cap: 20_000_000,
        conversionType: "post",
      },
      {
        investment: 50_000,
        discount: 0,
        cap: 20_000_000,
        conversionType: "post",
      },
      {
        investment: 311_147.8,
        discount: 0,
        cap: 20_000_000,
        conversionType: "post",
      },
      {
        investment: 250_000,
        discount: 0,
        cap: 20_000_000,
        conversionType: "post",
      },
    ];
    const seriesInvestments = [10_199_995.29];

    const expectedValuation = 60_000_046;
    const expectedTotalShares = 19_436_361;
    const expectedTotalOptions = 1_943_636;
    const fit = fitConversion(
      preMoneyValuation,
      common,
      safes,
      unusedOptions,
      0.1,
      seriesInvestments,
      { roundDownShares: true, roundPPSPlaces: 5 },
    );

    expect(fit.totalShares).toEqual(expectedTotalShares);
    expect(fit.totalOptions).toEqual(expectedTotalOptions);
    expect(Math.round(fit.pps * fit.totalShares)).toEqual(expectedValuation);
  });
  // When a user puts in a target option pool of less than the existing options pool, we should just use the existing options pool, not subtract from it
  test("when the target options pool is less than the current pool", () => {
    const preMoneyValuation = 16_700_000;
    const common = 9_390_728;
    const unusedOptions = { name: "Unused options", amount: 609_272 };
    const safes: ISafeInvestment[] = [
      // YC 7% on $125k is $1,785,714.28571429 cap
      {
        investment: 125_000,
        discount: 0,
        cap: 125_000 / 0.07,
        conversionType: "post",
      },
      { investment: 375_000, discount: 0, cap: 0, conversionType: "post" },
      {
        investment: 475_000,
        discount: 0,
        cap: 10_000_000,
        conversionType: "post",
      },
      {
        investment: 28_500,
        discount: 0,
        cap: 13_000_000,
        conversionType: "post",
      },
      {
        investment: 2_997_500,
        discount: 0,
        cap: 30_000_000,
        conversionType: "post",
      },
    ];
    const seriesInvestments = [4_000_000];

    const fit = fitConversion(
      preMoneyValuation,
      common,
      safes,
      unusedOptions.amount,
      0.01,
      seriesInvestments,
      { roundDownShares: false, roundPPSPlaces: -1 },
    );

    expect(Math.round(fit.totalOptions)).toEqual(609_272);
  });
});
