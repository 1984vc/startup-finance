// You can access any of the global GAS objects in this file. You can also
// import local files or external dependencies:
import { ISafeInvestment, RoundingStrategy, fitConversion } from "./safe_conversion";

function SAFE_CONVERSION(
  preMoney: number,
  commonShares: number,
  safeRanges: [investment: number, cap: number, discount: number, type: string][],
  unusedOptions: number,
  targetOptionsPct: number,
  seriesInvestment: number,
  roundDownShares: boolean = true,
  roundPPS: boolean = false,
  roundPPSPlaces: number = 12,
): [string, number][] {

  const safes: ISafeInvestment[] = safeRanges.map((e) => {
    return {
      investment: e[0],
      cap: e[1],
      discount: e[2],
      type: e[3].match(/^pre/i) ? "pre" : "post"
    }
  })
  const roundingStrategy: RoundingStrategy = {
    roundDownShares,
    roundPPS,
    roundPPSPlaces,
  }
  const fit = fitConversion(preMoney, commonShares, safes, unusedOptions, targetOptionsPct, seriesInvestment, roundingStrategy)
  return [
    ["Calculated At", Date.now() / 1000],
    ["PreMoney", Number(fit.preMoneyShares)],
    ["PostMoney", Number(fit.postMoneyShares)],
    ["TotalShares", Number(fit.totalShares)],
    ["PPS", Number(fit.pps)]
  ]
}

function VERSION() {
  // Replaced via WebPack DefinePlugin with the package.json version
  return process.env.VERSION
}

function onOpen(
  e:
    | GoogleAppsScript.Events.DocsOnOpen
    | GoogleAppsScript.Events.SlidesOnOpen
    | GoogleAppsScript.Events.SheetsOnOpen
    | GoogleAppsScript.Events.FormsOnOpen,
): void {
  console.log(e);
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  console.log(e);
}

function onInstall(e: GoogleAppsScript.Events.AddonOnInstall): void {
  console.log(e);
}

function doGet(e: GoogleAppsScript.Events.DoGet): void {
  console.log(e);
}

function doPost(e: GoogleAppsScript.Events.DoPost): void {
  console.log(e);
}

export { onOpen, onEdit, onInstall, doGet, doPost, SAFE_CONVERSION, VERSION };

// Hack to get in custom function JSDOCS
declare const global: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/**
 * Finds the best fit for the conversion of SAFEs to priced rounds
 * 
 * @param { number }  preMoney Premoney valuation
 * @param { Array }   safeRanges  Range of cells containing the SAFE data [investment, cap, discount, type]
 * @param { number }  unusedOptions  Unused options
 * @param { number }  targetOptionsPct  Target options pool percentage
 * @param { number }  seriesInvestment  Total amount of a priced investment round
 * @return An array of key value pairs
 * @customfunction
*/
global.SAFE_CONVERSION = SAFE_CONVERSION;

/**
 * Returns the version of the script
 *
 * @return The sematic version of this script
 * @customfunction
 */
global.VERSION = VERSION;
