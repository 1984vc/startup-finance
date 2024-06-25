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
}

const SAFEInputRow: React.FC<SAFEInputRowProps> = ({
  data,
  onDelete,
  onUpdate,
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
      onUpdate({ ...data, [name]: value });
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
        decimalScale={2}
      />
      <CurrencyInput
        type="text"
        name="cap"
        value={data.cap}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        decimalScale={2}
      />
      <input
        type="text"
        name="discount"
        value={data.discount}
        onChange={handleInputChange}
        placeholder="Discount %"
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {data.discount > 99 && <p className="text-red-500">Invalid discount</p>}
      <select
        name="type"
        value={data.conversionType}
        onChange={handleInputChange}
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="post">Post Money</option>
        <option value="pre">Pre Money</option>
      </select>
      <button
        onClick={() => onDelete(data.id)}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Delete
      </button>
    </div>
  );
};

const SafeNoteList: React.FC<RowsProps<SAFEInputData>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
}) => {
  return (
    <div>
      {rows.map((note, idx) => (
        <SAFEInputRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
      <button onClick={onAddRow}>Add another SAFE note</button>
    </div>
  );
};

export default SafeNoteList;
