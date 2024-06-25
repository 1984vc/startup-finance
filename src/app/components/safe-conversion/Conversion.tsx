import React, { useState } from "react";
import SafeNotes, { SAFEInputData } from "./SafeNoteList";
import CommonStockList, { CommonStockInputData } from "./CommonStockList";
import SeriesInvestorList, { SeriesInputData } from "./SeriesInvestmentList";
import { fitConversion } from "@/library/safe_conversion";
import { stringToNumber } from "@/app/utils/numberFormatting";
import CurrencyInput from "react-currency-input-field";
import { initialState } from "./initialState";
import Results from "./Results";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: RowData) => void;
}

type RowData = SAFEInputData | CommonStockInputData | SeriesInputData;

export interface ConversionState {
  randomFounders: string[];
  randomSeed: string[];
  randomSeries: string[];
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const commonStock = (
    state.rowData.filter(
      (row) => row.type === "common"
    ) as CommonStockInputData[]
  )
    .map((row) => row.shares)
    .reduce((acc, val) => acc + val, 0);
  const totalShares = commonStock;
  const pps = fitConversion(
    stringToNumber(state.preMoney),
    totalShares,
    state.rowData.filter((row) => row.type === "safe") as SAFEInputData[],
    stringToNumber(state.unusedOptions),
    stringToNumber(state.targetOptionsPool) / 100,
    (
      state.rowData.filter((row) => row.type === "series") as SeriesInputData[]
    ).map((row) => row.investment),
    { roundDownShares: true, roundPPSPlaces: 5 }
  );
  console.log(
    state.preMoney,
    totalShares,
    state.rowData.filter((row) => row.type === "safe") as SAFEInputData[],
    state.unusedOptions,
    state.targetOptionsPool,
    (
      state.rowData.filter((row) => row.type === "series") as SeriesInputData[]
    ).map((row) => row.investment)
  );

  const onValueChange = (
    value: string | undefined,
    name: string | undefined
  ) => {
    if (name) {
      setState((prevFormData) => ({
        ...prevFormData,
        [name]: parseFloat(value ?? "0"),
      }));
    }
  };

  return (
    <div>
      <div>
        <h1>Premoney Valuation</h1>
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
      <div className="flex space-x-4">
        <div className="flex-1">
          <h1>Unused Options</h1>
          <CurrencyInput
            type="text"
            name="unusedOptions"
            value={state.unusedOptions}
            onValueChange={onValueChange}
            placeholder="Unused Options"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            prefix=""
            decimalScale={0}
            allowDecimals={false}
          />
        </div>
        <div className="flex-1">
          <h1>Target Options Pool</h1>
          <CurrencyInput
            type="text"
            name="targetOptionsPool"
            value={state.targetOptionsPool}
            onValueChange={onValueChange}
            placeholder="Target Options Pool %"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            prefix=""
            suffix="%"
            decimalScale={0}
            max={99}
            maxLength={2}
            allowDecimals={false}
          />
        </div>
      </div>
      <h1>Common Stock</h1>
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
        />
      </div>
      <h1>SAFE Notes</h1>
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
        />
      </div>
      <h1>Series Investors</h1>
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
        />
      </div>
      <h1>Total Value</h1>
      {pps !== null && <Results state={state} bestFit={pps} />}
    </div>
  );
};

export default Conversion;
