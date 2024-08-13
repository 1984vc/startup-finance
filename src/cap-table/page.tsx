"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";

import {
  ConversionStore,
  createConversionStore,
  getPricedConversion,
  IConversionStateData,
  SeriesState,
} from "./state/ConversionState";
import CurrencyInput from "react-currency-input-field";
import ExisingShareholderList from "@/components/safe-conversion/Conversion/ExistingShareholders";
import PricedRound from "@/components/safe-conversion/Conversion/PricedRound";
import SeriesInvestorList from "@/components/safe-conversion/Conversion/SeriesInvestorList";
import { stringToNumber } from "@/utils/numberFormatting";
import { getExistingShareholderPropsSelector } from "./state/ExistingShareholderSelector";
import { getRandomData, initialState } from "./state/initialState";
import { getSAFERowPropsSelector } from "./state/SAFESelector";
import { getSeriesPropsSelector } from "./state/SeriesSelector";
import SafeNoteList from "@/components/safe-conversion/Conversion/SafeNoteList";
import { getPriceRoundPropsSelector } from "./state/PricedRoundSelector";
import Share from "@/components/safe-conversion/Conversion/Share";
import { compressState, decompressState } from "@/utils/stateCompression";
import { CapTableResults } from "@/components/safe-conversion/Conversion/CapTableResults";
import { getSAFEOnlyCapTableSelector } from "./state/SAFEOnlyCapTableSelector";
import { getCapTablePropsSelector } from "./state/CapTableSelector";

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
    targetOptionsPool,
    onAddRow,
    onDeleteRow,
    onUpdateRow,
    onValueChange,
  } = state;

  const hasNewRound = true


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

  return (
    <div className={"not-prose"}>
      <div className="w-full text-right">
        <Share url={saveURL}></Share>
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div>
        <ExisingShareholderList
          rows={getExistingShareholderPropsSelector(state)}
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={(data) => {
            if (data.id === "UnusedOptionsPool") {
              onValueChange("number")(data.shares.toString(), "unusedOptions");
            } else {
              onUpdateRow(data)
            }
          }}
        />
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-8">2) SAFE Investors</h1>
      <div>
        <SafeNoteList
          rows={getSAFERowPropsSelector(state)}
          onAddRow={() => onAddRow("safe")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
        />
      </div>

      <div className="pt-10">
        <h2 className="text-lg font-bold mb-4 inline not-prose">
          Cap Table Before Priced Round
        </h2>
        <p>This assumes that all our SAFE's convert at their Cap</p>
        <CapTableResults
          {...getSAFEOnlyCapTableSelector({
            ...state,
          })}
        />
      </div>

      <div style={{ display: hasNewRound ? "block" : "none" }}>
        <h1 className="text-1xl font-bold mb-4 mt-8">3) New Round</h1>
        <div className="flex space-x-4 ml-10">
          <div className="flex-1">
            <h2 className="my-2 not-prose">Premoney Valuation</h2>
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
            <h2 className="my-2 not-prose">Post Money Valuation</h2>
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
              <CurrencyInput
                type="text"
                name="totalSeriesInvestment"
                value={postMoney}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-inherit border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                prefix="$"
                decimalScale={0}
                allowDecimals={false}
                disabled={true}
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-4 ml-10">
          <div className="flex-1">
            <h2 className="my-2 not-prose">Target Options Pool</h2>
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
            <h2 className="my-2 not-prose">Additional Options</h2>
            <CurrencyInput
              type="text"
              name="additionalOptions"
              value={pricedConversion?.additionalOptions}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-inherit border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          />
        </div>
      </div>
      <div className="pt-10">
        <h2 className="text-2xl font-bold mb-4 not-prose">Priced Round Overview</h2>
        <PricedRound
          {...getPriceRoundPropsSelector({
            ...state,
            preMoneyChange,
            investmentChange,
          })}
          updateInvestmentChange={updateInvestmentChange}
          updatePreMoneyChange={updatePreMoneyChange}
        />
        <h2 className="text-lg font-bold mb-4 mt-8 not-prose">
          Cap Table after Priced Round
        </h2>
        <CapTableResults
          {...getCapTablePropsSelector({
            ...state,
            preMoneyChange,
            investmentChange,
          })}
        />
      </div>
    </div>
  );
};

const Page: React.FC = () => {

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-between py-8 min-w-[1024px]">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <Conversion />
        </div>
      </main>
    </div>
  );
};

export default Page;
