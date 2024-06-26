import React from "react";
import { RowsProps } from "./Conversion";
import { formatUSDWithCommas } from "@/app/utils/numberFormatting";
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
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="investment"
        value={data.investment}
        onValueChange={onValueChange}
        placeholder="Investment"
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        allowDecimals={false}
      />
      <CurrencyInput
        type="text"
        name="cap"
        value={data.cap}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        className="flex-1 w-36 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="flex-1 w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="post">Post Money</option>
        <option value="pre">Pre Money</option>
      </select>
      {allowDelete && (
        <button
          onClick={() => onDelete(data.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
      )}
      <div className="flex-1">{ownershipPct.toFixed(2)}%</div>
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
  const safeOwnershipPct = rows.map((data, idx) => {
    if (!bestFit) return 0;
    const pps = bestFit.ppss[idx];
    const shares = Math.floor(data.investment / pps);
    return (shares / bestFit.totalShares) * 100;
  });

  return (
    <div>
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
      <button onClick={onAddRow}>Add another SAFE note</button>
    </div>
  );
};

export default SafeNoteList;
