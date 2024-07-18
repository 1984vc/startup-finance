import React, { useState } from "react";
import SafeNotes, { SAFEInputData } from "./SafeNoteList";
import CommonStockList, { CommonStockInputData } from "./CommonStockList";
import SeriesInvestorList, { SeriesInputData } from "./SeriesInvestmentList";
import { BestFit, fitConversion } from "@/library/safe_conversion";
import { stringToNumber } from "@/app/utils/numberFormatting";
import CurrencyInput, { CurrencyInputOnChangeValues } from "react-currency-input-field";
import { initialState } from "./initialState";
import Results from "./Results";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: RowData) => void;
  bestFit?: BestFit;
}

type RowData = SAFEInputData | CommonStockInputData | SeriesInputData;

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
  const [state, setState] = useState<ConversionState>(initialState);

  const onAddRow = (type: "safe" | "series" | "common") => {
    if (type === "safe") {
      setState((prevFormData) => ({
        ...prevFormData,
        rowData: [
          ...prevFormData.rowData,
          {
            id: crypto.randomUUID(),
            type: "safe",
            name: `${
              state.randomSeed[
                state.rowData.filter((r) => r.type === "safe").length %
                  state.randomSeed.length
              ]
            }`,
            investment: 0,
            cap: 0,
            discount: 0,
            conversionType: "post",
          },
        ],
      }));
    } else if (type === "common") {
      setState((prevFormData) => ({
        ...prevFormData,
        rowData: [
          ...prevFormData.rowData,
          {
            id: crypto.randomUUID(),
            type: "common",
            name: `${
              state.randomFounders[
                state.rowData.filter((r) => r.type === "common").length %
                  state.randomFounders.length
              ]
            }`,
            shares: 0,
          },
        ],
      }));
    } else if (type === "series") {
      setState((prevFormData) => ({
        ...prevFormData,
        rowData: [
          ...prevFormData.rowData,
          {
            id: crypto.randomUUID(),
            type: "series",
            name: `${
              state.randomSeries[
                state.rowData.filter((r) => r.type === "series").length %
                  state.randomSeries.length
              ]
            }`,
            investment: 0,
          },
        ],
      }));
    }
  };

  const onDeleteRow = (id: string): void => {
    console.log("delete ", id);
    setState((prevFormData) => ({
      ...prevFormData,
      rowData: prevFormData.rowData.filter((row) => row.id !== id),
    }));
  };

  const onUpdateRow = (data: RowData) => {
    setState((prevFormData) => ({
      ...prevFormData,
      rowData: prevFormData.rowData.map((row) =>
        row.id === data.id ? data : row
      ),
    }));
  };

  const commonStock = (
    state.rowData.filter(
      (row) => row.type === "common"
    ) as CommonStockInputData[]
  )
    .map((row) => row.shares)
    .reduce((acc, val) => acc + val, 0);

  const totalSeriesInvesment = (
    state.rowData.filter((row) => row.type === "series") as SeriesInputData[]
  )
    .map((row) => row.investment)
    .reduce((acc, val) => acc + val, 0);

  const postMoney = stringToNumber(state.preMoney) + totalSeriesInvesment;

  const totalShares = commonStock;
  const bestFit = fitConversion(
    stringToNumber(state.preMoney),
    totalShares,
    (state.rowData.filter((row) => row.type === "safe") as SAFEInputData[]).map(
      (row) => {
        return {
          investment: stringToNumber(row.investment),
          cap: stringToNumber(row.cap),
          discount: stringToNumber(row.discount) / 100,
          conversionType: row.conversionType,
        };
      }
    ),
    stringToNumber(state.unusedOptions),
    stringToNumber(state.targetOptionsPool) / 100,
    (
      state.rowData.filter((row) => row.type === "series") as SeriesInputData[]
    ).map((row) => row.investment),
    { roundDownShares: true, roundPPSPlaces: 5 }
  );

  const onValueChange = (
    value: string | undefined,
    name: string | undefined,
    values?: CurrencyInputOnChangeValues
  ) => {
    if (name) {
      let val = values?.float ?? 0;
      if (val < 0) {
        return
      }
      // Get the value and replace anything that's not a number or period
      const newValue = value?.replace(/[^0-9.]/g, "");
      setState((prevFormData) => ({
        ...prevFormData,
        [name]: newValue ?? "0",
      }));
    }
  };

  const onPercentValueChange = (
    value: string | undefined,
    name: string | undefined,
    values?: CurrencyInputOnChangeValues
  ) => {
    if (name) {
      let val = values?.float ?? 0;
      if (val > 99 || val < 0) {
        return
      }
      const newValue = value?.replace(/[^0-9.]/g, "");
      setState((prevFormData) => ({
        ...prevFormData,
        [name]: newValue ?? "0",
      }));
    }
  };

  return (
    <div>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <CommonStockList
          rows={
            state.rowData.filter(
              (row) => row.type === "common"
            ) as CommonStockInputData[]
          }
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
          bestFit={bestFit}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <div className="flex-1">
          <h2 className="mb-2">Remaining Options Pool</h2>
          <CurrencyInput
            type="text"
            name="unusedOptions"
            value={state.unusedOptions}
            onValueChange={onValueChange}
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
          rows={
            state.rowData.filter(
              (row) => row.type === "safe"
            ) as SAFEInputData[]
          }
          onAddRow={() => onAddRow("safe")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
          bestFit={state.hasNewRound ? bestFit : undefined}
        />
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-8">3) New Round
        <input type="checkbox" checked={state.hasNewRound} onClick={() => setState({...state, hasNewRound: !state.hasNewRound})}></input>
      </h1>

      <div style={{ display: state.hasNewRound ? "block" : "none" }}>
        <div className="flex space-x-4">
          <div className="flex-1">
            <h2 className="my-2">Premoney Valuation</h2>
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
              <CurrencyInput
                type="text"
                name="preMoney"
                value={state.preMoney}
                onValueChange={onValueChange}
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
              value={state.targetOptionsPool}
              onValueChange={onPercentValueChange}
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
              value={bestFit.additionalOptions}
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
              state.rowData.filter(
                (row) => row.type === "series"
              ) as SeriesInputData[]
            }
            onAddRow={() => onAddRow("series")}
            onDelete={onDeleteRow}
            onUpdate={onUpdateRow}
            bestFit={bestFit}
          />
        </div>
      </div>
      {bestFit !== null && <Results state={state} bestFit={bestFit} />}
    </div>
  );
};

export default Conversion;
