import React from "react";
import CurrencyInput from "react-currency-input-field";
import { RowsProps } from "./PropTypes";
import { XCircleIcon } from "@heroicons/react/24/outline";

export interface SeriesProps {
  id: string;
  type: "series";
  name: string;
  investment: number;
  ownership: {
    shares?: number;
    percent: number;
    error?: string | undefined;
    reason?: string | undefined;
  }[];
  allowDelete?: boolean;
}

interface SeriesRowProps {
  data: SeriesProps;
  onDelete: (id: string) => void;
  onUpdate: (data: SeriesProps) => void;
  allowDelete?: boolean;
}

const SeriesInvestorRow: React.FC<SeriesRowProps> = ({
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
      <button
        onClick={() => onDelete(data.id)}
        disabled={!data.allowDelete}
        className={`w-6 p-2 rounded-md focus:outline-none focus:ring-2 ${
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
        placeholder="Series Investor Name"
        className="w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CurrencyInput
        type="text"
        name="investment"
        value={data.investment}
        onValueChange={onValueChange}
        placeholder="Investment"
        autoComplete="off"
        className="w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        decimalScale={0}
      />
      <div className="w-24 text-right">{data.ownership[0].percent.toFixed(2)}%</div>
    </div>
  );
};

const SeriesInvestorList: React.FC<RowsProps<SeriesProps>> = ({
  rows,
  onDelete,
  onUpdate,
  onAddRow,
}) => {
  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-6"></div>
        <div className="w-48">Name</div>
        <div className="w-32">Investment</div>
        <div className="w-24 text-right">Ownership %</div>
      </div>
      {rows.map((note, idx) => (
        <SeriesInvestorRow
          key={idx}
          data={note}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
      <button
        onClick={onAddRow}
        className="ml-10 px-4 py-2 rounded-md bg-nt84blue text-white hover:bg-nt84bluedarker focus:outline-none focus:ring-blue-500"
      >
        Add another Series Investor
      </button>
    </div>
  );
};

export default SeriesInvestorList;
