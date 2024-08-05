"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
  getPricedConversion,
  IConversionStateData,
  SeriesState,
} from "./state/ConversionState";
import CurrencyInput from "react-currency-input-field";
import ExisingShareholderList from "../components/safe-conversion/Conversion/ExistingShareholders";
import PricedRound from "../components/safe-conversion/Conversion/PricedRound";
import SeriesInvestorList from "../components/safe-conversion/Conversion/SeriesInvestorList";
import { stringToNumber } from "../../utils/numberFormatting";
import { getExistingShareholderPropsSelector } from "./state/ExistingShareholderSelector";
import { getRandomData, initialState } from "./state/initialState";
import { getSAFERowPropsSelector } from "./state/SAFESelector";
import { getSeriesPropsSelector } from "./state/SeriesSelector";
import SafeNoteList from "../components/safe-conversion/Conversion/SafeNoteList";
import { getPriceRoundPropsSelector } from "./state/PricedRoundSelector";
import Share from "../components/safe-conversion/Conversion/Share";
import { compressState, decompressState } from "@/utils/stateCompression";
import { CapTableResults } from "../components/safe-conversion/Conversion/CapTableResults";
import { getSAFEOnlyCapTableSelector } from "./state/SAFEOnlyCapTableSelector";
import ToolipComponent from "../components/tooltip/Tooltip";

const Conversion: React.FC = () => {
  const randomInvestors = useRef<ReturnType<typeof getRandomData>>();
  if (!randomInvestors.current) {
    randomInvestors.current = getRandomData();
  }

  const store = useRef<ConversionStore>();
  if (!store.current) {
    // If first run, set the initial state to a default or the hash value
    const hash = window.location.hash?.slice(1);
    let hashState: any | undefined = undefined;
    if (hash) {
      try {
        hashState = decompressState(hash);
      } catch (e) {
        console.error("Error parsing state from hash", e);
      }
    }
    if (hashState) {
      store.current = createConversionStore(hashState as IConversionStateData);
    } else {
      store.current = createConversionStore(
        initialState({ ...randomInvestors.current }),
      );
    }
  }

  if (store.current === undefined) {
    throw new Error("State is undefined");
  }

  const state = useStore(store.current);
  const {
    rowData,
    preMoney,
    unusedOptions,
    targetOptionsPool,
    hasNewRound,
    onAddRow,
    onDeleteRow,
    onUpdateRow,
    onValueChange,
    togglePricedRound,
  } = state;

  const [saveURL, setSaveURL] = useState<string>(
    window.location.href + window.location.hash,
  );

  useEffect(() => {
    if (store.current === undefined) {
      throw new Error("State is undefined");
    }
    const hash = compressState(state);
    const url = window.location.href + "#" + hash;
    window.location.hash = hash;
    setSaveURL(url);
  }, [state]);

  const totalSeriesInvesment = (
    rowData.filter((row) => row.type === "series") as SeriesState[]
  )
    .map((row) => row.investment)
    .reduce((acc, val) => acc + val, 0);

  const postMoney = stringToNumber(preMoney) + totalSeriesInvesment;
  const pricedConversion = getPricedConversion(state);

  const [preMoneyChange, updatePreMoneyChange] = useState(0);
  const [investmentChange, updateInvestmentChange] = useState(0);

  const hasSAFEs = rowData.filter((row) => row.type === 'safe').length > 0

  return (
    <div>
      <Share url={saveURL}></Share>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div className="">
        <ExisingShareholderList
          rows={getExistingShareholderPropsSelector(state)}
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
          pricedConversion={pricedConversion}
          safePercent={15}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <div className="flex-1">
          <h2 className="mb-2">Remaining Options Pool</h2>
          <CurrencyInput
            type="text"
            name="unusedOptions"
            value={unusedOptions}
            onValueChange={onValueChange("number")}
            placeholder="Unused Options"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            prefix=""
            decimalScale={0}
            allowDecimals={false}
          />
        </div>
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-8">2) SAFE Investors</h1>
      <div className="">
        <SafeNoteList
          rows={getSAFERowPropsSelector(state)}
          onAddRow={() => onAddRow("safe")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
          pricedConversion={pricedConversion}
        />
      </div>

      {/* Toggle button to show/hide new round */}
      <button
        onClick={() => togglePricedRound(!hasNewRound)}
        className={`mt-8 px-4 py-2 rounded-md focus:outline-none focus:ring-2 text-white ${
          hasNewRound
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
            : "bg-blue-500"
        }`}
      >
        {hasNewRound ? "Remove Priced Round" : "Add Priced Round"}
      </button>

      <div style={{ display: hasNewRound ? "block" : "none" }}>
        <h1 className="text-1xl font-bold mb-4 mt-8">3) New Round</h1>
        <div className="flex space-x-4">
          <div className="flex-1">
            <h2 className="my-2">Premoney Valuation</h2>
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
              <CurrencyInput
                type="text"
                name="preMoney"
                value={preMoney}
                onValueChange={onValueChange("number")}
                placeholder="Investment"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                prefix="$"
                decimalScale={0}
                allowDecimals={false}
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="my-2">Post Money Valuation</h2>
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
              <CurrencyInput
                type="text"
                name="totalSeriesInvestment"
                value={postMoney}
                className="flex-1 px-3 py-2 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                prefix="$"
                decimalScale={0}
                allowDecimals={false}
                disabled={true}
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <h2 className="my-2">Target Options Pool</h2>
            <CurrencyInput
              type="text"
              name="targetOptionsPool"
              value={targetOptionsPool}
              onValueChange={onValueChange("percent")}
              placeholder="Target Options Pool %"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              prefix=""
              suffix="%"
              decimalScale={1}
              max={99}
              allowDecimals={true}
            />
          </div>
          <div className="flex-1">
            <h2 className="my-2">Additional Options</h2>
            <CurrencyInput
              type="text"
              name="additionalOptions"
              value={pricedConversion?.additionalOptions}
              className="w-full bg-gray-100 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              prefix=""
              decimalScale={0}
              max={99}
              maxLength={2}
              allowDecimals={false}
              disabled={true}
            />
          </div>
        </div>
        <h1 className="text-1xl font-bold mb-4 mt-5">3a) Series Investors</h1>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <SeriesInvestorList
            rows={getSeriesPropsSelector(state)}
            onAddRow={() => onAddRow("series")}
            onDelete={onDeleteRow}
            onUpdate={onUpdateRow}
            pricedConversion={getPricedConversion(state)}
          />
        </div>
      </div>
      {pricedConversion !== undefined && (
        <div className="pt-10">
          <h2 className="text-2xl font-bold mb-4">Priced Round Overview</h2>
          <PricedRound
            {...getPriceRoundPropsSelector({
              ...state,
              preMoneyChange,
              investmentChange,
            })}
            updateInvestmentChange={updateInvestmentChange}
            updatePreMoneyChange={updatePreMoneyChange}
          />
          <CapTableResults {...getPriceRoundPropsSelector({
            ...state,
            preMoneyChange,
            investmentChange,
          })} />
        </div>
      )}
      {pricedConversion == undefined && (
        <div className="pt-10">
          {/* If we have SAFE's use a tooltip, otherwise just the heading */}
          { hasSAFEs ? 
            <ToolipComponent content="If SAFE's convert at their Cap">
            <h2 className="text-2xl font-bold mb-4 inline">
              Cap Table <sup>*</sup>
            </h2>
            </ToolipComponent> :
            <h2 className="text-2xl font-bold mb-4 inline">
              Cap Table
            </h2>
          }
          <CapTableResults {...getSAFEOnlyCapTableSelector({
            ...state,
          })} />
        </div>
      )}
    </div>
  );
};

const Page: React.FC = () => {
  // We use random values which gets the DOM out of sync SS vs Client in development
  // This is a hack to make sure the DOM is in sync and prevent hydration flashing of different random values
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [ready]);

  if (!ready) {
    return;
  }

  return (
    <div>
      <div className="absolute">
        <Link href="https://1984.vc" className="w-64">
          <Image
            src="/startup-finance/images/logo.svg"
            alt="1984 Logo"
            className="dark:invert pt-16 pl-16"
            width={120}
            height={120}
            priority
          />
        </Link>
      </div>
      <main className="flex min-h-screen flex-col items-center justify-between px-24 py-8 min-w-[1024px]">
        <h1 className="text-xl">1984 SAFE Conversion Worksheet</h1>
        <h2 className="text-orange-700">
          Warning: Beta version, expect changes
        </h2>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Conversion />
        </div>
      </main>
      <div className="flex justify-center p-8 my-4">
        <div className="text-sm text-gray-500">
          Copyright 2024{" "}
          <Link
            className="text-blue-600 hover:text-blue-800"
            href="https://1984.vc"
          >
            1984 Ventures
          </Link>{" "}
          - {""}
          <Link
            className="text-blue-600 hover:text-blue-800"
            href="https://github.com/1984vc/startup-finance/blob/main/PRIVACY.md"
          >
            Privacy Policy
          </Link>{" "}
          - {""}
          <Link
            className="text-blue-600 hover:text-blue-800"
            href="https://github.com/1984vc/startup-finance"
          >
            Github
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
