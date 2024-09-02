import { BestFit, DEFAULT_ROUNDING_STRATEGY } from "@library/conversion-solver";
import { checkSafeNotesForErrors, populateSafeCaps } from "@library/safe-calcs";
import { RoundingStrategy, roundShares } from "@library/utils/rounding";
import { SAFENote, CommonStockholder, CommonCapTableRow, SafeCapTableRow, TotalCapTableRow, StakeHolder } from ".";
import { buildErrorPreRoundCapTable, buildTBDPreRoundCapTable } from "./error";

// Builds a preRound cap table assuming there are no refreshed options
// Needs to handle 3 possible states:
// 1. Round modelled with max Cap
// 2. Round entirely TBD because no max cap
// 3. Error due to some non-sensical input (investment exceeds cap)
export const buildEstimatedPreRoundCapTable = (stakeHolders: StakeHolder[], roundingStrategy: RoundingStrategy = DEFAULT_ROUNDING_STRATEGY): {common: CommonCapTableRow[], safes: SafeCapTableRow[], total: TotalCapTableRow} => {
  const commonShareholders = stakeHolders.filter((stakeHolder) => stakeHolder.type === "common") as CommonStockholder[];

  // The premoney shares are used to determine the pre-money safe conversions (SAFE cap / PreMoneyShares)
  const preMoneyShares = commonShareholders.reduce((acc, stockholder) => acc + stockholder.shares, 0);

  // Handle any MFN side-letters and find the following best cap
  const safeNotes = populateSafeCaps(stakeHolders.filter((stakeHolder) => stakeHolder.type === "safe") as SAFENote[])

  // Handle Error, just stop here and generate an error cap table
  if (safeNotes.some((safeNote) => safeNote.cap !== 0 && safeNote.cap <= safeNote.investment)) {
    return buildErrorPreRoundCapTable(safeNotes, [...commonShareholders])
  }

  const maxCap = safeNotes.reduce((max, stakeholder) => Math.max(max, stakeholder.cap), 0)

  // Handle cases where we simply can't build an estimated cap table until a priced round
  if (maxCap === 0) {
    return buildTBDPreRoundCapTable(safeNotes, [...commonShareholders])
  }
  
  // Step one, convert all the SAFE's with the following rules
  // 1. Premoney SAFE | shares = (investment/cap) * preMoneyShares
  // 2. PostMoney SAFE | ownershipPct = investment / cap
  // 
  // Next, use the Post Money SAFE pct to calculate the total pre-round shares
  // postMoneyShares = (preMoneyShare + preMoneySafeShares) / (1 - totalSafePercent)
  //
  // Finally, get the preMoneySafe percents using preMoneySafe shares / postMoneyShares


  const totalInvestment = [...safeNotes].reduce((acc, investor) => acc + investor.investment, 0);

  let safeCapTable: SafeCapTableRow[] = safeNotes.map((safe) => {
    if (safe.conversionType === 'pre') {
      const cap = (safe.cap === 0 ? maxCap / preMoneyShares : safe.cap)
      const shares = roundShares((safe.investment / cap) * preMoneyShares, roundingStrategy)
      return {
        name: safe.name,
        cap: safe.cap,
        discount: safe.discount,
        shares: shares,
        investment: safe.investment,
        type: "safe",
      }
    } else {
      return {
        name: safe.name,
        cap: safe.cap,
        discount: safe.discount,
        ownershipPct: safe.investment / (safe.cap === 0 ? maxCap : safe.cap),
        investment: safe.investment,
        type: "safe",
      }
    }
  })


  const preMoneySafeShares = safeCapTable.reduce((acc, safe) => acc + (safe.shares ?? 0), 0)
  const postSharePct = safeCapTable.reduce((acc, safe) => acc + (safe.ownershipPct ?? 0), 0)
  // Now we can use this to get pre-money ownership Pct
  const postShareCapitilization = roundShares((preMoneyShares + preMoneySafeShares) / ( 1 - postSharePct), roundingStrategy)

  // Now recalc all the safes with this information
  safeCapTable = safeCapTable.map((safe) => {
    if (safe.shares && safe.shares > 0) {
      const pct = safe.shares / postShareCapitilization
      return {
        name: safe.name,
        cap: safe.cap,
        discount: safe.discount,
        shares: safe.shares,
        ownershipPct: pct,
        investment: safe.investment,
        type: "safe",
      }
    } else {
      return {
        ...safe,
        shares: roundShares((safe.ownershipPct ?? 0) * postShareCapitilization, roundingStrategy)
      }
    }
  })

  safeCapTable = safeCapTable.map((safe) => {
    if (safe.cap === 0) {
      return {
        ...safe,
        ownershipError: {
          type: "caveat",
          reason: "No cap set for this SAFE, ownership based on max cap of all other SAFE's",
        },
      }
    }
    return {...safe}
  })



  const commonCapTable: CommonCapTableRow[] = commonShareholders.map((stockholder) => {
    return {
      name: stockholder.name,
      shares: stockholder.shares,
      ownershipPct: stockholder.shares / postShareCapitilization,
      type: "common",
    }
  })

  // Retotal the shares to account for rounding
  const totalShares = preMoneyShares + safeCapTable.reduce((acc, safe) => acc + (safe.shares ?? 0), 0)

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