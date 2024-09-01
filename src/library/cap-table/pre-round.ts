import { fitConversion, DEFAULT_ROUNDING_STRATEGY, BestFit } from "@library/conversion-solver";
import { checkSafeNotesForErrors, populateSafeCaps } from "@library/safe-calcs";
import { roundShares } from "@library/utils/rounding";
import { SAFENote, CommonStockholder, CommonCapTableRow, SafeCapTableRow, TotalCapTableRow, StakeHolder } from ".";
import { buildErrorPreRoundCapTable, buildTBDPreRoundCapTable } from "./error";

// Builds a preRound cap table by modeling a "priced round" with $0 series investment where possible
// Needs to handle 3 possible states:
// 1. Round modelled with max Cap
// 2. Round entirely TBD because no max cap
// 3. Error due to some non-sensical input (investment exceeds cap)
export const buildEstimatedPreRoundCapTable = (stakeHolders: StakeHolder[]): {common: CommonCapTableRow[], safes: SafeCapTableRow[], total: TotalCapTableRow} => {
  const commonShareholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common" && stakeHolder.commonType !== 'unusedOptions') as CommonStockholder[];
  const unusedOptionsRows = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common" && stakeHolder.commonType === 'unusedOptions') as CommonStockholder[];
  let unusedOptions = 0
  if (unusedOptionsRows.length > 0) {
    unusedOptions = unusedOptionsRows[0].shares
  }
  const totalCommonShares = commonShareholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);

  const safeNotes = populateSafeCaps(stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[])

  if (safeNotes.some((safeNote) => safeNote.cap !== 0 && safeNote.cap <= safeNote.investment)) {
    return buildErrorPreRoundCapTable(safeNotes, [...commonShareholders, ...unusedOptionsRows])
  }

  const maxCap = safeNotes.reduce((max, stakeholder) => Math.max(max, stakeholder.cap), 0)
  if (maxCap === 0) {
    return buildTBDPreRoundCapTable(safeNotes, [...commonShareholders, ...unusedOptionsRows])
  }
  const pricedConversion = fitConversion(maxCap, totalCommonShares, safeNotes, unusedOptions, 0, [], DEFAULT_ROUNDING_STRATEGY)

  const totalInvestment = [...safeNotes].reduce((acc, investor) => acc + investor.investment, 0);
  const totalShares = pricedConversion.totalShares;

  const safeCapTable: SafeCapTableRow[] = safeNotes.map((safe, idx) => {
    const pps = pricedConversion.ppss[idx];
    const shares = roundShares(safe.investment / pps, pricedConversion.roundingStrategy);
    const ownershipPct = shares / totalShares;
    if (safe.cap === 0) {
      return {
        name: safe.name,
        cap: safe.cap,
        discount: safe.discount,
        ownershipPct,
        ownershipError: {
          type: "caveat",
          reason: "No cap set for this SAFE, ownership based on max cap of all other SAFE's",
        },
        investment: safe.investment,
        type: "safe",
      }
    }
    return {
      name: safe.name,
      investment: safe.investment,
      ownershipPct,
      discount: safe.discount,
      cap: safe.cap,
      type: "safe",
    }
  })


  const commonCapTable: CommonCapTableRow[] = commonShareholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalShares,
      type: "common",
    }
  })
  commonCapTable.push({
    name: "Unused Options",
    shares: unusedOptions,
    ownershipPct: unusedOptions / totalShares,
    type: "common"
  })


  return {
    common: commonCapTable,
    safes: safeCapTable,
    total: {
      name: "Total",
      // In a pre-round cap table, the total shares are just the common shares since we can't know the PPS yet
      shares: totalCommonShares + unusedOptions,
      investment: totalInvestment,
      ownershipPct: 1,
      type: "total",
    },
  }
}

// Build a pre-round cap table once we have a pricedRound to convert at
export const buildPreRoundCapTable = (pricedConversion: BestFit, stakeHolders: StakeHolder[]): {common: CommonCapTableRow[], safes: SafeCapTableRow[], total: TotalCapTableRow} => {
  const commonShareholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common") as CommonStockholder[];
  const safeNotes = populateSafeCaps(stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[])
  const totalShares = pricedConversion.totalShares - pricedConversion.seriesShares - pricedConversion.additionalOptions;

  const totalInvestment = [...safeNotes].reduce((acc, investor) => acc + investor.investment, 0);

  if (checkSafeNotesForErrors(safeNotes)) {
    return buildErrorPreRoundCapTable(safeNotes, commonShareholders)
  }

  const commonCapTable: CommonCapTableRow[] = commonShareholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / totalShares,
      type: "common",
    }
  })

  const safeCapTable: SafeCapTableRow[] = safeNotes.map((safe, idx) => {
    const pps = pricedConversion.ppss[idx];
    const shares = roundShares(safe.investment / pps, pricedConversion.roundingStrategy);
    const ownershipPct = shares / totalShares;
    return {
      name: safe.name,
      investment: safe.investment,
      ownershipPct,
      discount: safe.discount,
      cap: safe.cap,
      shares,
      type: "safe",
      pps,
    }
  })

  return {
    common: commonCapTable,
    safes: safeCapTable,
    total: {
      name: "Total",
      // In a pre-round cap table, the total shares are just the common shares since we can't know the PPS yet
      shares: totalShares,
      investment: totalInvestment,
      ownershipPct: 1,
      type: "total",
    },
  }
}