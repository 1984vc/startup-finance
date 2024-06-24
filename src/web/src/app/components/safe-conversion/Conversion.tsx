import React, { useState } from "react";
import SafeNotes, { SAFEInputData } from "./SafeNoteList";
import CommonStockList, { CommonStockInputData } from "./CommonStockList";
import SeriesInvestorList, { SeriesInputData } from "./SeriesInvestmentList";
import { topInternetEntrepreneurs } from "@/app/utils/techFounders";
import { top100 } from "@/app/utils/vcs";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: RowData) => void;
}

type RowData = SAFEInputData | CommonStockInputData | SeriesInputData;

interface ConversionState {
  targetOptionsPool: string | number | readonly string[] | undefined;
  rowData: RowData[];
  unusedOptions: number;
  preMoney: number;
  randomInvestors: string[];
  randomVCs: string[];
}

function getRandomInvestors(num: number): string[] {
  const investorNames = topInternetEntrepreneurs.sort(() => Math.random() - 0.5);
  return investorNames.slice(0, num);
}

function getRandomVCs(num: number): string[] {
  const investorNames = top100.sort(() => Math.random() - 0.5);
  return investorNames.slice(0, num);
}

const Conversion: React.FC = () => {
  const [state, setState] = useState<ConversionState>(() => {
    console.log("Setting state");
    const randomInvestors = getRandomInvestors(20);
    const randomVCs = getRandomVCs(20);

    return {
      randomInvestors,
      randomVCs,
      rowData: [
        {
          id: crypto.randomUUID(),
          type: "common",
          name: `${randomInvestors[0]}`,
          shares: 3_000_000,
        },
        {
          id: crypto.randomUUID(),
          type: "safe",
          name: `${randomVCs[0]}`,
          investment: 100_000,
          valuationCap: 10_000_000,
          discount: 20,
          conversionType: "post",
        },
        {
          id: crypto.randomUUID(),
          type: "series",
          name: "Series 1",
          investment: 1_000_000,
        },
      ],
      unusedOptions: 0,
      preMoney: 10_000_000,
      targetOptionsPool: 10,
    };
  });

  const onAddRow = (type: "safe" | "series" | "common") => {
    console.log(state);
    if (type === "safe") {
      setState((prevFormData) => ({
        ...prevFormData,
        rowData: [
          ...prevFormData.rowData,
          {
            id: crypto.randomUUID(),
            type: "safe",
            name: `SAFE ${prevFormData.rowData.length + 1}`,
            investment: 0,
            valuationCap: 0,
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
            name: `Common ${prevFormData.rowData.length + 1}`,
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
            name: `Series ${prevFormData.rowData.length + 1}`,
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
      rowData: prevFormData.rowData.map((row) => (row.id === data.id ? data : row)),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const commonStock = 10; // Replace with your actual common stock value
  const totalValue = state.unusedOptions + commonStock;

  return (
    <div>
      <div>
        <h1>Premoney Valuation</h1>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <input
            type="text"
            name="preMoney"
            onChange={handleInputChange}
            value={state.preMoney}
            placeholder="Premoney Valuation"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <h1>Common Stock</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <CommonStockList
          rows={state.rowData.filter((row) => row.type === "common") as CommonStockInputData[]}
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
        />
      </div>
      <div>
        <h1>Unused Options</h1>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <input
            type="text"
            name="unusedOptions"
            onChange={handleInputChange}
            value={state.unusedOptions}
            placeholder="Unused Options Shares"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h1>Target Options Pool</h1>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <input
            type="text"
            name="targetOptionsPool"
            onChange={handleInputChange}
            value={state.targetOptionsPool}
            placeholder="Unused Options Shares"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <h1>SAFE Notes</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <SafeNotes
          rows={state.rowData.filter((row) => row.type === "safe") as SAFEInputData[]}
          onAddRow={() => onAddRow("safe")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
        />
      </div>
      <h1>Series Investors</h1>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <SeriesInvestorList
          rows={state.rowData.filter((row) => row.type === "series") as SeriesInputData[]}
          onAddRow={() => onAddRow("series")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
        />
      </div>
      <h1>Total Value</h1>
      <div>{totalValue}</div>
    </div>
  );
};

export default Conversion;
