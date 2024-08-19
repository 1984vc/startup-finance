import React from "react";
import CurrencyInput from "react-currency-input-field";
import { RowsProps } from "./PropTypes";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { OwnershipPctNotes } from "./PricedRound";
import PercentNote from "./PercentNote";

export interface SAFEProps {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  conversionType: "post" | "pre" | "mfn";
  conversionDisplay: "post" | "pre" | "mfn" | "yc7p" | "ycmfn";
  ownership: {
    shares?: number
    percent: number;
    note?: OwnershipPctNotes
  } [];
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

  const handleDropDownChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (value === "yc7p") {
      onUpdate({ ...data, ["name"]: "YC 7%", ["investment"]: 125_000, ["cap"]: 125_000 / 0.07, ["conversionType"]: "post" });
    } else if (value === "ycmfn") {
      onUpdate({ ...data, ["name"]: "YC MFN", ["investment"]: 375_000, ["cap"]: 0, ["conversionType"]: "mfn" });
    } else if (value === "post" || value === "pre" || value === "mfn") {
      onUpdate({ ...data, [name]: value, ["conversionType"]: value})
    }
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
      <button
        onClick={() => onDelete(data.id)}
        disabled={!data.allowDelete}
        className={`w-6 focus:outline-none focus:ring-2 ${
          data.allowDelete
            ? "text-red-400 hover:text-red-500"
            : "text-gray-500 cursor-not-allowed"
        }`}
      >
        <XCircleIcon className="inline" width={20} />
      </button>
      <input
        type="text"
        name="name"
        autoComplete="off"
        value={data.name}
        onChange={handleInputChange}
        placeholder="Name"
        className="w-48 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="investment"
        value={data.investment}
        onValueChange={onValueChange}
        placeholder="Investment"
        autoComplete="off"
        className="w-36 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        allowDecimals={false}
      />
      <CurrencyInput
        type="text"
        name="cap"
        value={data.cap}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        autoComplete="off"
        className={data.disabledFields?.includes("cap") ? "w-36 px-3 py-2 border-b border-b-gray border-none" : "w-36 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"}
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
        className="w-20 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        autoComplete="off"
        prefix=""
        suffix="%"
        decimalScale={0}
        max={99}
        maxLength={2}
        allowDecimals={false}
      />
      {data.discount > 99 && <p className="text-red-500">Invalid discount</p>}
      <select
        name="conversionDisplay"
        value={data.conversionDisplay}
        onChange={handleDropDownChange}
        className="w-36 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="post">Post Money</option>
        <option value="pre">Pre Money</option>
        <option value="mfn">Uncapped MFN</option>
        <option value="yc7p">YC $125K/7%</option>
        <option value="ycmfn">YC $375K/MFN</option>
      </select>
      <div className="w-24 border-b py-2 border-gray-300 dark:border-gray-700">
        <PercentNote pct={data.ownership[0].percent} note={data.ownership[0].note} />
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
        <div className="w-6"> </div>
        <div className="w-48">Name</div>
        <div className="w-36">Investment</div>
        <div className="w-36">Cap</div>
        <div className="w-20">Discount</div>
        <div className="w-36">Type</div>
        <div className="w-24">Ownership %</div>
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
        className="ml-10 px-4 py-2  bg-nt84blue text-white hover:bg-nt84bluedarker focus:outline-none focus:ring-blue-500"
      >
        Add another SAFE note
      </button>
    </div>
  );
};

export default SafeNoteList;
