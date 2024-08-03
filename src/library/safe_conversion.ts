export interface ISafeInvestment {
  investment: number;
  discount: number;
  cap: number;
  conversionType: "post" | "pre" | "mfn";
}

export type BestFit = {
  pps: number;
  ppss: number[];
  convertedSafeShares: number;
  seriesShares: number;
  preMoneyShares: number;
  postMoneyShares: number;
  totalShares: number;
  additionalOptions: number;
  totalOptions: number;
};

export type RoundingStrategy = {
  roundDownShares: boolean;
  // If no rounding, set to -1
  roundPPSPlaces: number;
};

export const DEFAULT_ROUNDING_STRATEGY: RoundingStrategy = {
  roundDownShares: true,
  roundPPSPlaces: 5,
};

const sumArray = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

const sumSafeConvertedShares = (
  safes: ISafeInvestment[],
  pps: number,
  preMoneyShares: number,
  postMoneyShares: number,
  roundingStrategy: RoundingStrategy,
): number => {
  return sumArray(
    safes.map((safe) => {
      let discountPPS = safeConvert(safe, preMoneyShares, postMoneyShares, pps);
      if (roundingStrategy.roundPPSPlaces >= 0) {
        discountPPS = roundPPSToPlaces(
          discountPPS,
          roundingStrategy.roundPPSPlaces,
        );
      }
      const postSafeShares = safe.investment / discountPPS;
      if (roundingStrategy.roundDownShares) {
        return Math.floor(postSafeShares);
      }
      return postSafeShares;
    }),
  );
};

// PPS is actually rounded up vs shares which are rounded down
const roundPPSToPlaces = (num: number, places: number): number => {
  const factor = Math.pow(10, places);
  return Math.ceil(num * factor) / factor;
};

// Returns the PPS of a conversion given the amount of shares and the price of the shares
export const safeConvert = (
  safe: ISafeInvestment,
  preShares: number,
  postShares: number,
  pps: number,
): number => {
  if (safe.cap === 0) {
    return (1 - safe.discount) * pps;
  }
  const discountPPS = (1 - safe.discount) * pps;

  const shares = safe.conversionType === "pre" ? preShares : postShares;
  const capPPS = safe.cap / shares;
  return Math.min(discountPPS, capPPS);
};

// This is the entire process to "fit" a safe conversion to a series of investors and an options increase
const attemptFit = (
  preMoneyValuation: number,
  commonShares: number,
  unusedOptions: number,
  targetOptionsPct: number,
  safes: ISafeInvestment[],
  seriesInvestments: number[],
  preMoneyShares: number,
  postMoneyShares: number,
  roundingStrategy: RoundingStrategy = DEFAULT_ROUNDING_STRATEGY,
): [preMoneyShare: number, postMoneyShares: number] => {
  // On the first attempt these are just a starting point
  let newPreMoneyShares = preMoneyShares;
  let newPostMoneyShares = postMoneyShares;

  // preMoneyShares = commonShares + increaseInOptionsPool so
  let increaseInOptionsPool = newPreMoneyShares - commonShares - unusedOptions;

  // First calculate the PPS based on what we know
  const ppsPrecise =
    preMoneyValuation / (newPostMoneyShares + increaseInOptionsPool);
  const pps =
    roundingStrategy.roundPPSPlaces >= 0
      ? roundPPSToPlaces(ppsPrecise, roundingStrategy.roundPPSPlaces ?? 5)
      : ppsPrecise;

  // Figure out the new postMoneyShares AFTER the SAFE conversions
  newPostMoneyShares =
    sumSafeConvertedShares(
      safes,
      pps,
      newPreMoneyShares,
      newPostMoneyShares,
      roundingStrategy,
    ) +
    commonShares +
    unusedOptions;

  // Now we need to see if the optionsPool needs to change based on the series investments
  const seriesShares = sumArray(
    seriesInvestments.map((seriesInvestment) =>
      roundingStrategy.roundDownShares
        ? Math.floor(seriesInvestment / pps)
        : seriesInvestment / pps,
    ),
  );

  // Options pool is based on series shares + SAFE conversions - unused options
  const optionPoolBase = seriesShares + newPostMoneyShares - unusedOptions;
  increaseInOptionsPool = roundingStrategy.roundDownShares
    ? Math.floor(optionPoolBase / (1 - targetOptionsPct)) -
      optionPoolBase -
      unusedOptions
    : optionPoolBase / (1 - targetOptionsPct) - optionPoolBase - unusedOptions;
  if (increaseInOptionsPool < 0) {
    increaseInOptionsPool = 0;
  }

  // Finally, run the latest numbers
  newPreMoneyShares = commonShares + unusedOptions + increaseInOptionsPool;
  newPostMoneyShares =
    sumSafeConvertedShares(
      safes,
      pps,
      newPreMoneyShares,
      newPostMoneyShares,
      roundingStrategy,
    ) +
    commonShares +
    unusedOptions;

  return [newPreMoneyShares, newPostMoneyShares];
};

// Takes in common shares and safe investments and returns the pps in the same order
export const fitConversion = (
  // The premoney valuation of the round
  preMoneyValuation: number,
  // Existing shareholders (doesn't include unused options)
  commonShares: number,
  // The SAFE's we wish to convert
  safes: ISafeInvestment[],
  // Our unused options - This plus existing is the total shares we currently have
  unusedOptions: number,
  // Our new target option pool size
  targetOptionsPct: number,
  // The series investors on the priced round
  seriesInvestments: number[],
  roundingStrategy: RoundingStrategy = DEFAULT_ROUNDING_STRATEGY,
): BestFit => {
  // Use this figure as a starting point
  let preMoneyShares: number = commonShares + unusedOptions;
  let postMoneyShares: number = commonShares + unusedOptions;

  // Start solving
  for (let i = 0; i < 100; i++) {
    const [pre, post] = attemptFit(
      preMoneyValuation,
      commonShares,
      unusedOptions,
      targetOptionsPct,
      safes,
      seriesInvestments,
      preMoneyShares,
      postMoneyShares,
      roundingStrategy,
    );

    if (pre == preMoneyShares && post == postMoneyShares) {
      // Once the figure stops changing, we've solved the conversion
      break;
    }
    preMoneyShares = pre;
    postMoneyShares = post;
  }

  // Back out some numbers to make display easier
  const increaseInOptionsPool = preMoneyShares - commonShares - unusedOptions;

  const ppsPrecise =
    preMoneyValuation / (postMoneyShares + increaseInOptionsPool);
  const pps =
    roundingStrategy.roundPPSPlaces >= 0
      ? roundPPSToPlaces(ppsPrecise, roundingStrategy.roundPPSPlaces ?? 5)
      : ppsPrecise;

  // Get a list of the PPS's for each SAFE
  const ppss: number[] = Array(safes.length).fill(pps);
  for (const [idx, safe] of Array.from(safes.entries())) {
    ppss[idx] = roundPPSToPlaces(
      safeConvert(safe, preMoneyShares, postMoneyShares, pps),
      5,
    );
  }

  const convertedSafeShares = sumSafeConvertedShares(
    safes,
    pps,
    preMoneyShares,
    postMoneyShares,
    roundingStrategy,
  );

  const seriesShares = sumArray(
    seriesInvestments.map((seriesInvestment) =>
      roundingStrategy.roundDownShares
        ? Math.floor(seriesInvestment / pps)
        : seriesInvestment / pps,
    ),
  );

  // Finally, tabulate the total shares
  const totalShares = seriesShares + postMoneyShares + increaseInOptionsPool;

  return {
    pps,
    ppss,
    totalShares,
    preMoneyShares,
    postMoneyShares,
    convertedSafeShares,
    seriesShares,
    additionalOptions: increaseInOptionsPool,
    totalOptions: increaseInOptionsPool + unusedOptions,
  };
};
