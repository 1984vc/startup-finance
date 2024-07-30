import React from "react";
import CurrencyInput from "react-currency-input-field";
import { RowsProps } from "./PropTypes";
import ToolipComponent from "../../tooltip/Tooltip";

export interface SAFEProps {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  conversionType: "post" | "pre" | "mfn";
  ownershipPct: number;
  ownershipError?: string;
  ownershipErrorReason?: string;
  allowDelete?: boolean;
  shares?: number;
  disabledFields?: string[];
}

interface SAFEInputRowProps {
  data: SAFEProps;
  onDelete: (id: string) => void;
  onUpdate: (data: SAFEProps) => void;
}

const SAFEInputRow: React.FC<SAFEInputRowProps> = ({
  data,
  onDelete,
  onUpdate,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };

  const onValueChange = (
    value: string | undefined,
    name: string | undefined,
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
        disabled={data.disabledFields?.includes("cap")}
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
        <option value="mfn">Uncapped MFN</option>
      </select>
      <button
        onClick={() => onDelete(data.id)}
        disabled={!data.allowDelete}
        className={`w-24 px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
          data.allowDelete
            ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Delete
      </button>
      <div className="w-36 text-right">
        { data.ownershipError
          ? <ToolipComponent content={data.ownershipErrorReason ?? ""}>{data.ownershipError}<sup>*</sup></ToolipComponent>
          : data.ownershipPct.toFixed(2) + "%"
        }
      </div>
    </div>
  );
};

const SafeNoteList: React.FC<RowsProps<SAFEProps>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
}) => {
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
