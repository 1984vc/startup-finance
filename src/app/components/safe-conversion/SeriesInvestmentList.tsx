import React from "react";
import { RowsProps } from "./Conversion";
import CurrencyInput from "react-currency-input-field";

export interface SeriesInputData {
  id: string;
  type: "series";
  name: string;
  investment: number;
}

interface SeriesRowProps {
  data: SeriesInputData;
  onDelete: (id: string) => void;
  onUpdate: (data: SeriesInputData) => void;
  ownershipPct: number;
  allowDelete?: boolean;
}

const SeriesInvestorRow: React.FC<SeriesRowProps> = ({
  data,
  onDelete,
  onUpdate,
  ownershipPct,
  allowDelete,
}) => {
  const formatShares = (value: number) => {
    return value.toLocaleString("en-US");
  };

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
        placeholder="Series Investor Name"
        className="w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="investment"
        value={data.investment}
        onValueChange={onValueChange}
        placeholder="Investment"
        className="w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        decimalScale={0}
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
      <div className="w-24 text-right">{ownershipPct.toFixed(2)}%</div>
    </div>
  );
};

const SeriesInvestorList: React.FC<RowsProps<SeriesInputData>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
  pricedConversion,
}) => {
  const seriesOwnershipPct = rows.map((data, idx) => {
    if (!pricedConversion) return 0;
    const shares = Math.floor(data.investment / pricedConversion.pps);
    return (shares / pricedConversion.totalShares) * 100;
  });

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-48">Name</div>
        <div className="w-32">Investment</div>
        <div className="w-24"></div>
        <div className="w-24 text-right">Ownership %</div>
      </div>
      {rows.map((note, idx) => (
        <SeriesInvestorRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
          ownershipPct={seriesOwnershipPct[idx]}
          allowDelete={rows.length > 1}
        />
      ))}
      <button
        onClick={onAddRow}
        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-blue-500"
      >
        Add another Series Investor
      </button>
    </div>
  );
};

export default SeriesInvestorList;
