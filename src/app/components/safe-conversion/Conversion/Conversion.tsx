"use client";

import React, { useRef } from "react";
import SafeNotes from "./SafeNoteList";
import ExisingShareholderList from "./ExistingShareholders";
import SeriesInvestorList from "./SeriesInvestorList";
import { BestFit } from "@/library/safe_conversion";
import { stringToNumber } from "@/app/utils/numberFormatting";
import CurrencyInput from "react-currency-input-field";
import { getExistingShareholderPropsSelector, getPricedConversion, getSAFERowPropsSelector, getSeriesPropsSelector, IRowState, SeriesState, createConversionStore, ConversionStore } from "./state/ConversionState";
import Results from "./Results";
import { getRandomData, initialState } from "./state/initialState";
import { useStore } from "zustand";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: IRowState) => void;
  pricedConversion: BestFit | undefined;
}

const Conversion: React.FC = () => {

  const randomInvestors = useRef<ReturnType<typeof getRandomData>>()
  if (!randomInvestors.current) {
    randomInvestors.current = getRandomData()
  }

  const ref = useRef<ConversionStore>()
  if (!ref.current) {
    ref.current = createConversionStore(initialState({...randomInvestors.current}));
  }

  if (ref.current === undefined) { throw new Error("State is undefined") }

  const state = useStore(ref.current);
  const {rowData, preMoney, unusedOptions ,targetOptionsPool, hasNewRound, onAddRow, onDeleteRow, onUpdateRow, onValueChange, togglePricedRound } = state;

  const totalSeriesInvesment = (
    rowData.filter((row) => row.type === "series") as SeriesState[]
  )
    .map((row) => row.investment)
    .reduce((acc, val) => acc + val, 0);

  const postMoney = stringToNumber(preMoney) + totalSeriesInvesment;
  const pricedConversion = getPricedConversion(state);

  return (
    <div>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
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
            onValueChange={onValueChange('number')}
            placeholder="Unused Options"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            prefix=""
            decimalScale={0}
            allowDecimals={false}
          />
        </div>
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-8">2) SAFE Investors</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <SafeNotes
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
        { hasNewRound ? "Remove Priced Round" : "Add Priced Round" }
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
                onValueChange={onValueChange('number')}
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
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onValueChange={onValueChange('percent')}
              placeholder="Target Options Pool %"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              prefix=""
              suffix="%"
              decimalScale={1}
              max={99}
              allowDecimals={true}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <h2 className="my-2">Additional Options</h2>
            <CurrencyInput
              type="text"
              name="additionalOptions"
              value={pricedConversion?.additionalOptions}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      { pricedConversion !== undefined && <Results
        state={state}
      />
      }
    </div>
  );
};

export default Conversion;
