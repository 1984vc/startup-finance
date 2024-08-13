export const DEFAULT_ROUNDING_STRATEGY = {
    roundShares: false,
    roundPPSPlaces: 5,
};
// Legal spreadsheets tend to round down shares, allow for this to be configurable
const roundShares = (num, strategy) => {
    if (strategy.roundDownShares) {
        return Math.floor(num);
    }
    else if (strategy.roundShares) {
        return Math.round(num);
    }
    return num;
};
// Legal spreadsheets tend to round to 5 decimal places, allow for this to be configurable
const roundPPSToPlaces = (num, places) => {
    if (places < 0) {
        return num;
    }
    const factor = Math.pow(10, places);
    return Math.ceil(num * factor) / factor;
};
// Quick utility to sum an array of numbers
const sumArray = (arr) => arr.reduce((a, b) => a + b, 0);
// Sum the shares of the safes after conversion
const sumSafeConvertedShares = (safes, pps, preMoneyShares, postMoneyShares, roundingStrategy) => {
    return sumArray(safes.map((safe) => {
        let discountPPS = roundPPSToPlaces(safeConvert(safe, preMoneyShares, postMoneyShares, pps), roundingStrategy.roundPPSPlaces);
        const postSafeShares = safe.investment / discountPPS;
        return roundShares(postSafeShares, roundingStrategy);
    }));
};
// Returns the PPS of a conversion given the amount of shares and the price of the shares
export const safeConvert = (safe, preShares, postShares, pps) => {
    if (safe.cap === 0) {
        return (1 - safe.discount) * pps;
    }
    const discountPPS = (1 - safe.discount) * pps;
    const shares = safe.conversionType === "pre" ? preShares : postShares;
    const capPPS = safe.cap / shares;
    return Math.min(discountPPS, capPPS);
};
// Here's what we know:
// 1. The amount of pre-money shares are equal to the sum of the common shares and the increase in options pool
// 2. The amount of post-money shares are equal to the total shares minus the series shares and the increase in options pool
// This function calculates the pre-money and post-money shares using the minimum amount of information needed
const calculatePreAndPostMoneyShares = (preMoneyValuation, commonShares, unusedOptions, targetOptionsPct, seriesInvestments, totalShares, // This is only number that changes
roundingStrategy = DEFAULT_ROUNDING_STRATEGY) => {
    let optionsPool = roundShares(totalShares * targetOptionsPct, roundingStrategy);
    // Don't let the options pool be less than the unused options. Assume the unused options are the minimum
    if (optionsPool < unusedOptions) {
        optionsPool = unusedOptions;
    }
    const increaseInOptionsPool = optionsPool - unusedOptions;
    let seriesInvestment = sumArray(seriesInvestments.map((seriesInvestment) => {
        return seriesInvestment;
    }));
    let pps = roundPPSToPlaces((preMoneyValuation + seriesInvestment) / totalShares, roundingStrategy.roundPPSPlaces);
    const seriesShares = sumArray(seriesInvestments.map((seriesInvestment) => roundShares(seriesInvestment / pps, roundingStrategy)));
    const preMoneyShares = commonShares + increaseInOptionsPool;
    const postMoneyShares = totalShares - seriesShares - increaseInOptionsPool;
    return {
        preMoneyShares,
        postMoneyShares,
        pps,
        optionsPool,
        increaseInOptionsPool,
        totalShares: postMoneyShares + increaseInOptionsPool + seriesShares, // We need to take into account the rounding of the Series shares
        seriesShares, // Helpful for debugging
    };
};
// Allows us to "test" a fit of the total shares to see if it's stable
const attemptFit = (preMoneyValuation, commonShares, unusedOptions, targetOptionsPct, safes, seriesInvestments, totalShares, // This is only number that changes
roundingStrategy = DEFAULT_ROUNDING_STRATEGY) => {
    // Calculate the pre and post money shares using the total shares as the only variable
    const results = calculatePreAndPostMoneyShares(preMoneyValuation, commonShares, unusedOptions, targetOptionsPct, seriesInvestments, totalShares, roundingStrategy);
    // Use the pre and post money shares to calculate the new SAFE shares conversions
    let safeShares = sumSafeConvertedShares(safes, results.pps, results.preMoneyShares, results.postMoneyShares, roundingStrategy);
    // This changes the total shares based on how the SAFEs converted
    // Determine the new total shares, this could be different than the original total shares
    let newTotalShares = results.seriesShares + commonShares + results.optionsPool + safeShares;
    return newTotalShares;
};
// Takes in common shares and safe investments and returns the pps in the same order
export const fitConversion = (
// The premoney valuation of the round
preMoneyValuation, 
// Existing shareholders (doesn't include unused options)
commonShares, 
// The SAFE's we wish to convert
safes, 
// Our unused options - This plus existing is the total shares we currently have
unusedOptions, 
// Our new target option pool size
targetOptionsPct, 
// The series investors on the priced round
seriesInvestments, roundingStrategy = DEFAULT_ROUNDING_STRATEGY) => {
    // Use this figure as a starting point
    let totalShares = commonShares + unusedOptions;
    let lastTotalShares = totalShares;
    // Walk the total shares up until we find a stable value where
    // the total shares converges
    for (let i = 0; i < 100; i++) {
        totalShares = attemptFit(preMoneyValuation, commonShares, unusedOptions, targetOptionsPct, safes, seriesInvestments, totalShares, roundingStrategy);
        if (totalShares === lastTotalShares) {
            break;
        }
        lastTotalShares = totalShares;
    }
    // Grab the final results
    const { pps, preMoneyShares, postMoneyShares, increaseInOptionsPool, seriesShares, } = calculatePreAndPostMoneyShares(preMoneyValuation, commonShares, unusedOptions, targetOptionsPct, seriesInvestments, totalShares, roundingStrategy);
    const convertedSafeShares = sumSafeConvertedShares(safes, pps, preMoneyShares, postMoneyShares, roundingStrategy);
    // Get a list of the PPS's for each SAFE
    const ppss = Array(safes.length).fill(pps);
    for (const [idx, safe] of Array.from(safes.entries())) {
        ppss[idx] = safeConvert(safe, preMoneyShares, postMoneyShares, pps);
    }
    return {
        pps,
        ppss,
        totalShares,
        newSharesIssued: totalShares - commonShares - unusedOptions,
        preMoneyShares,
        postMoneyShares,
        convertedSafeShares,
        seriesShares,
        additionalOptions: increaseInOptionsPool,
        totalOptions: increaseInOptionsPool + unusedOptions,
    };
};