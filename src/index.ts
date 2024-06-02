// You can access any of the global GAS objects in this file. You can also
// import local files or external dependencies:
import { ISafeInvestment, RoundingStrategy, fitConversion } from "./safe_conversion";

// Simple Triggers: These five export functions are reserved export function names that are
// called by Google Apps when the corresponding event occurs. You can safely
// delete them if you won't be using them, but don't use the same export function names
// for anything else.
// See: https://developers.google.com/apps-script/guides/triggers

// NOTE: only `export {...}` syntax will work. You cannot define and export a trigger in
// the same line.

/**
 * Converts a SAFE to priced round investment
 * @param {number} preMoney Premoney valuation
 * @param {number} commonShares Existing shareholder amounts
 * @param {[investment: number, cap: number, discount: number, type: "pre" | "post"][]} safeRanges A range of SAFE Notes
 * @param {number} unusedOptions Amount of unused options
 * @param {number} targetOptionsPct Target for options pool percent after the conversion
 * @param {number} seriesInvestment Amount being invested in the priced round
 * @return The input multiplied by 2.
 * @customfunction
*/
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
) {

  const safes: ISafeInvestment[] = safeRanges.map((e) => {
    return {
      investment: e[0],
      cap: e[1],
      discount: e[2],
      type: e[3].match(/pre/i) ? "pre" : "post"
    }
  })
  const roundingStrategy: RoundingStrategy = {
    roundDownShares,
    roundPPS,
    roundPPSPlaces,
  }
  const fit = fitConversion(preMoney, commonShares, safes, unusedOptions, targetOptionsPct, seriesInvestment, roundingStrategy)
  return [
    ["Calculated", ""],
    ["PreMoney", fit.preMoneyShares],
    ["PostMoney", fit.postMoneyShares],
    ["TotalShares", fit.totalShares],
    ["PPS", fit.pps]
  ]
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

export { onOpen, onEdit, onInstall, doGet, doPost, SAFE_CONVERSION };
