import React from "react";
import { RowsProps } from "./Conversion";
import CurrencyInput from "react-currency-input-field";

export interface SAFEInputData {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  conversionType: "post" | "pre";
}

interface SAFEInputRowProps {
  data: SAFEInputData;
  onDelete: (id: string) => void;
  onUpdate: (data: SAFEInputData) => void;
  ownershipPct: number;
  allowDelete: boolean;
}

const SAFEInputRow: React.FC<SAFEInputRowProps> = ({
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
    console.log(name, value);
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
        placeholder="Name"
        className="w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="investment"
        value={data.investment}
        onValueChange={onValueChange}
        placeholder="Investment"
        className="w-36 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        allowDecimals={false}
      />
      <CurrencyInput
        type="text"
        name="cap"
        value={data.cap}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        className="w-36 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        decimalScale={0}
        allowDecimals={true}
      />
      <CurrencyInput
        type="text"
        name="discount"
        value={data.discount ?? "0"}
        onValueChange={onValueChange}
        placeholder="Discount %"
        className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        prefix=""
        suffix="%"
        decimalScale={0}
        max={99}
        maxLength={2}
        allowDecimals={false}
      />
      {data.discount > 99 && <p className="text-red-500">Invalid discount</p>}
      <select
        name="conversionType"
        value={data.conversionType}
        onChange={handleInputChange}
        className="w-36 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="post">Post Money</option>
        <option value="pre">Pre Money</option>
      </select>
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
      <div className="w-36 text-right">{ownershipPct.toFixed(2)}%</div>
    </div>
  );
};

const SafeNoteList: React.FC<RowsProps<SAFEInputData>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
  bestFit,
}) => {
  // Find the highest cap in our safes
  const safeOwnershipPct = rows.map((data, idx) => {
    // If we don't have a priced round, used the caps to generated an estimated percent
    if (!bestFit) {
      if (data.cap) {
        return (data.investment / data.cap) * 100
      }
      return 0
    }
    const pps = bestFit.ppss[idx];
    const shares = Math.floor(data.investment / pps);
    return (shares / bestFit.totalShares) * 100;
  });

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-48">Name</div>
        <div className="w-36">Investment</div>
        <div className="w-36">Cap</div>
        <div className="w-20">Discount</div>
        <div className="w-36">Type</div>
        <div className="w-24"> </div>
        <div className="w-36 text-right">Ownership %</div>
      </div>

      {rows.map((note, idx) => (
        <SAFEInputRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
          ownershipPct={safeOwnershipPct[idx]}
          allowDelete={rows.length > 1}
        />
      ))}
      <button
        onClick={onAddRow}
        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-blue-500"
      >
        Add another SAFE note
      </button>
    </div>
  );
};

export default SafeNoteList;
