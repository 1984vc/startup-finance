import React from "react";
import { RowsProps } from "./Conversion";
import CurrencyInput from "react-currency-input-field";
import { BestFit } from "@/library/safe_conversion";

export interface CommonStockInputData {
  id: string;
  type: "common";
  name: string;
  shares: number;
}

interface CommonStockRowProps {
  data: CommonStockInputData;
  onDelete: (id: string) => void;
  onUpdate: (data: CommonStockInputData) => void;
  ownershipPct: [number, number];
  allowDelete?: boolean;
}

const CommonStockRow: React.FC<CommonStockRowProps> = ({
  data,
  onDelete,
  onUpdate,
  ownershipPct,
  allowDelete,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };

  const onValueChange = (
    value: string | undefined,
    name: string | undefined
  ) => {
    if (name) {
      onUpdate({ ...data, [name]: parseFloat(value ?? "0") });
    }
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <input
        type="text"
        name="name"
        value={data.name}
        onChange={handleInputChange}
        placeholder="Common Shareholder Name"
        className="w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="shares"
        value={data.shares}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        className="w-36 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix=""
        decimalScale={0}
        allowDecimals={false}
      />
      <button
        onClick={() => onDelete(data.id)}
        disabled={!allowDelete}
        className={`w-24 px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
          allowDelete
            ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Delete
      </button>
      <div className="w-24 text-right">{ownershipPct[0].toFixed(2)}%</div>
      <div className="w-24 text-right">{ownershipPct[1].toFixed(2)}%</div>
    </div>
  );
};

const CommonStockList: React.FC<RowsProps<CommonStockInputData>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
  bestFit,
}) => {
  const totalShares = rows.map((row) => row.shares)
    .reduce((acc, val) => acc + val, 0);
  const shareholdersPct: [number, number][] = rows.map((data) => {
    return [
      100 * (data.shares / totalShares),
      100 * (data.shares / (bestFit?.totalShares ?? data.shares)),
    ];
  });

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-48">Name</div>
        <div className="w-36">Shares</div>
        <div className="w-24"></div>
        <div className="w-24 text-right">Ownership %</div>
        <div className="w-24 text-right">Diluted %</div>
      </div>
      {rows.map((note, idx) => (
        <CommonStockRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
          ownershipPct={shareholdersPct[idx]}
          allowDelete={rows.length > 1}
        />
      ))}
      <button
        onClick={onAddRow}
        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-blue-500"
      >
        Add another Shareholder
      </button>
    </div>
  );
};

export default CommonStockList;
