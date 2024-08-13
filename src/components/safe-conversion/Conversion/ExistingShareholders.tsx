import React from "react";
import CurrencyInput from "react-currency-input-field";
import { RowsProps } from "./PropTypes";
import { XCircleIcon } from "@heroicons/react/24/outline";
import QuestionMarkTooltipComponent from "@/components/tooltip/QuestionMarkTooltip";

export interface ExistingShareholderProps {
  id: string;
  type: "common";
  name: string;
  shares: number;
  ownership: {
    shares: number;
    percent: number;
    error?: string;
  }[];
  allowDelete?: boolean;
}

interface ExistingShareholderRowProps {
  data: ExistingShareholderProps;
  onDelete: (id: string) => void;
  onUpdate: (data: ExistingShareholderProps) => void;
  allowDelete?: boolean;
  disableNameEdit?: boolean;
}

const ExistingShareholderRow: React.FC<ExistingShareholderRowProps> = ({
  data,
  onDelete,
  onUpdate,
  allowDelete,
  disableNameEdit,
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

  const ownership = data.ownership[0]

  const button = () => {
    if (allowDelete) {
      return (
        <button
          onClick={() => onDelete(data.id)}
          className={"w-6 px-2 py-2 rounded-md focus:outline-none text-red-400 hover:text-red-500"}>
          <XCircleIcon className="inline" width={20} />
        </button>
      );
    } else if (data.id === "UnusedOptionsPool") {
      return (
        <div className="w-6 p-2 text-nt84bluedarker dark:text-nt84lightblue">
          <QuestionMarkTooltipComponent>
            <div className="max-w-72">
              <p>
                Reserved shares that have yet to be assigned as option grants for team members.
              </p>
              <i>
                [For example, if you have an option plan with 150,000 reserved shares and then granted 50,000 options to team members, your Unissued Option pool would be 100,000.]
              </i>
            </div>
          </QuestionMarkTooltipComponent>

        </div>
      );
    } else if (data.id === "IssuedOptions") {
      return (
        <div className="w-6 p-2 text-nt84bluedarker dark:text-nt84lightblue">
          <QuestionMarkTooltipComponent>
            <div className="max-w-72">
              Options or shares already issued to other employees, advisors, or shareholders in the company.
            </div>
          </QuestionMarkTooltipComponent>
        </div>
      );
    } else {
        <div className="w-6 p-2">
        </div>
    }
  }

  return (
    <div className="flex items-center space-x-4 mb-4">
      {button()}
      <input
        type="text"
        name="name"
        autoComplete="off"
        disabled={disableNameEdit ?? false}
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
      <div className="w-24 text-right">{ownership?.percent.toFixed(2)}%</div>
    </div>
  );
};

const ExisingShareholderList: React.FC<
  RowsProps<ExistingShareholderProps> 
> = ({ rows, onDelete, onUpdate, onAddRow }) => {
  // Don't include the UnusedOptionsRow in the editable list since this is edited in a seperate field
  const existingShareholders = rows.filter(
    (row) => ["UnusedOptionsPool", "IssuedOptions"].indexOf(row.id) === -1,
  );

  const issuedOptionsRow = rows.find((row) => row.id === "IssuedOptions")
  const unusedOptionsRow = rows.find((row) => row.id === "UnusedOptionsPool")

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-6"></div>
        <div className="w-48">Name</div>
        <div className="w-36">Shares</div>
        <div className="w-24 text-right">Ownership %</div>
      </div>
      {existingShareholders.map((shareholder, idx) => (
        <ExistingShareholderRow
          key={idx}
          data={shareholder}
          onUpdate={onUpdate}
          onDelete={onDelete}
          allowDelete={rows.length > 1}
        />
      ))}
      { issuedOptionsRow && (
        <ExistingShareholderRow
          data={issuedOptionsRow}
          onUpdate={onUpdate}
          onDelete={() => { }}
          allowDelete={false}
          disableNameEdit={true}
        />
      )}
      { unusedOptionsRow && (
        <ExistingShareholderRow
          data={unusedOptionsRow}
          onUpdate={onUpdate}
          onDelete={() => { }}
          allowDelete={false}
          disableNameEdit={true}
        />
      )}
      <button
        onClick={onAddRow}
        className="ml-10 px-4 py-2 rounded-md bg-nt84blue text-white hover:bg-nt84bluedarker focus:outline-none focus:ring-blue-500"
      >
        Add another Shareholder
      </button>
    </div>
  );
};

export default ExisingShareholderList;
