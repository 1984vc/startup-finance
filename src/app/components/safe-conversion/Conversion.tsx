import React, { useState } from "react";
import SafeNotes, { SAFEInputData } from "./SafeNoteList";
import ExisingShareholderList, { ExistingShareholderProps } from "./ExistingShareholders";
import SeriesInvestorList, { SeriesInputData } from "./SeriesInvestmentList";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { stringToNumber } from "@/app/utils/numberFormatting";
import CurrencyInput, { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { initialState } from "./initialState";
import Results from "./Results";
import { getExistingShareholderPropsSelector, getSAFERowPropsSelector, useConversionStore } from "./ConversionState";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: RowData) => void;
  pricedConversion?: BestFit;
}

export type RowData = SAFEInputData | ExistingShareholderProps | SeriesInputData;

export interface ConversionState {
  randomFounders: string[];
  randomSeed: string[];
  randomSeries: string[];
  hasNewRound?: boolean;
  targetOptionsPool: number;
  rowData: RowData[];
  unusedOptions: number;
  preMoney: number;
}

const Conversion: React.FC = () => {

  const state = useConversionStore();
  const {rowData, preMoney, unusedOptions ,targetOptionsPool, hasNewRound, onAddRow, onDeleteRow, onUpdateRow, onValueChange} = state;


  const commonStock = (
    rowData.filter(
      (row) => row.type === "common"
    ) as ExistingShareholderProps[]
  )
    .map((row) => row.shares)
    .reduce((acc, val) => acc + val, 0);

  const totalSeriesInvesment = (
    rowData.filter((row) => row.type === "series") as SeriesInputData[]
  )
    .map((row) => row.investment)
    .reduce((acc, val) => acc + val, 0);

  const postMoney = stringToNumber(preMoney) + totalSeriesInvesment;

  const totalShares = commonStock;
  const pricedConversion = fitConversion(
    stringToNumber(preMoney),
    totalShares,
    (rowData.filter((row) => row.type === "safe") as SAFEInputData[]).map(
      (row) => {
        return {
          investment: stringToNumber(row.investment),
          cap: stringToNumber(row.cap),
          discount: stringToNumber(row.discount) / 100,
          conversionType: row.conversionType,
        };
      }
    ),
    stringToNumber(unusedOptions),
    stringToNumber(targetOptionsPool) / 100,
    (
      rowData.filter((row) => row.type === "series") as SeriesInputData[]
    ).map((row) => row.investment),
    { roundDownShares: true, roundPPSPlaces: 5 }
  );


  return (
    <div>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <ExisingShareholderList
          rows={getExistingShareholderPropsSelector(state)} 
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
          pricedConversion={hasNewRound  ? pricedConversion : undefined}
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
          pricedConversion={hasNewRound ? pricedConversion : undefined}
        />
      </div>
      {/* <h1 className="text-1xl font-bold mb-4 mt-8">3) New Round
        <input type="checkbox" checked={hasNewRound} onClick={() => setState({...state, hasNewRound: !hasNewRound})}></input>
      </h1> */}

      <div style={{ display: hasNewRound ? "block" : "none" }}>
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
              value={pricedConversion.additionalOptions}
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
            rows={
              rowData.filter(
                (row) => row.type === "series"
              ) as SeriesInputData[]
            }
            onAddRow={() => onAddRow("series")}
            onDelete={onDeleteRow}
            onUpdate={onUpdateRow}
            pricedConversion={pricedConversion}
          />
        </div>
      </div>
      {/* {pricedConversion !== null && <Results state={state} pricedConversion={pricedConversion} />} */}
    </div>
  );
};

export default Conversion;
