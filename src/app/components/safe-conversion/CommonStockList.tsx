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
  ownershipPct: number;
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
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="shares"
        value={data.shares}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix=""
        decimalScale={0}
        allowDecimals={false}
      />
      <button
        onClick={() => onDelete(data.id)}
        disabled={!allowDelete}
        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
          allowDelete
            ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Delete
      </button>
      <div className="flex-1">{ownershipPct.toFixed(2)}%</div>
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
  const commonShareholdersPct = rows.map((data) => {
    return 100 * (data.shares / (bestFit?.totalShares ?? data.shares));
  });

  return (
    <div>
      {rows.map((note, idx) => (
        <CommonStockRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
          ownershipPct={commonShareholdersPct[idx]}
          allowDelete={rows.length > 1}
        />
      ))}
      <button onClick={onAddRow}>Add another Common Shareholder</button>
    </div>
  );
};

export default CommonStockList;
