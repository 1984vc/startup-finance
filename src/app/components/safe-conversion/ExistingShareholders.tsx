import React from "react";
import { RowsProps } from "./Conversion";
import CurrencyInput from "react-currency-input-field";
import { BestFit } from "@/library/safe_conversion";

export interface ExistingShareholderProps {
  id: string;
  type: "common";
  name: string;
  shares: number;
  ownershipPct?: number;
  dilutedPct?: number;
}

interface ExistingShareholderRowProps {
  data: ExistingShareholderProps;
  onDelete: (id: string) => void;
  onUpdate: (data: ExistingShareholderProps) => void;
  allowDelete?: boolean;
}

const ExistingShareholderRow: React.FC<ExistingShareholderRowProps> = ({
  data,
  onDelete,
  onUpdate,
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
      <div className="w-24 text-right">{data.ownershipPct?.toFixed(2)}%</div>
      <div className="w-24 text-right">{data.dilutedPct?.toFixed(2)}%</div>
    </div>
  );
};

const ExisingShareholderList: React.FC<RowsProps<ExistingShareholderProps> & {safePercent: number}> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
  pricedConversion,
  safePercent,
}) => {
  const totalInitialShares = rows.map((row) => row.shares)
    .reduce((acc, val) => acc + val, 0);
  const shareholdersPct: [number, number, number][] = rows.map((data) => {
    const startingOwnershipPct = (data.shares / totalInitialShares)
    const preConversionOwnership = (100 - safePercent) * startingOwnershipPct
    return [
      100 * startingOwnershipPct,
      preConversionOwnership,
      100 * (data.shares / (pricedConversion?.totalShares ?? data.shares)),
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
        <ExistingShareholderRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
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

export default ExisingShareholderList;
