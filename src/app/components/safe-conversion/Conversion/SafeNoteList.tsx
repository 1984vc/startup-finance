import React, { useEffect, useState } from "react";
import { formatNumberWithCommas } from "@/utils/numberFormatting";
import CurrencyInput from "react-currency-input-field";
import { RowsProps } from "./PropTypes";
import { Bars4Icon, XCircleIcon } from "@heroicons/react/24/outline";
import { OwnershipPctNotes } from "./PricedRound";
import PercentNote from "./PercentNote";

export interface SAFEProps {
  id: string;
  type: "safe";
  name: string;
  investment: number;
  cap: number;
  discount: number;
  // Legacy where we used to allow specific version of SAFE
  conversionType: "post" | "pre" | "mfn" | "yc7p" | "ycmfn";
  ownership: {
    shares?: number
    percent: number;
    note?: OwnershipPctNotes
    pps?: number
  } [];
  allowDelete?: boolean;
  shares?: number;
  disabledFields?: string[];
}

interface SAFEInputRowProps {
  data: SAFEProps;
  isHovered?: boolean;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (data: SAFEProps) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, index: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, index: string) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, dropIndex: string) => void;
}

const SAFEInputRow: React.FC<SAFEInputRowProps> = ({
  data,
  isHovered = false,
  isDragging = false,
  onDelete,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
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
    onUpdate({ ...data, [name]: value})
  };

  const onValueChange = (
    value: string | undefined,
    name: string | undefined,
  ) => {
    if (name) {
      onUpdate({ ...data, [name]: parseFloat(value ?? "0") });
    }
  };

  const conversionType = () => {
    if (data.conversionType === "yc7p") return "post";
    if (data.conversionType === "ycmfn") return "mfn";
    else return data.conversionType;
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>): void => {
    console.log("drag start", data.name, " - ", data.id);
    event.dataTransfer.setData('text/plain', data.id)
    onDragStart(event, data.id);
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    console.log("drag over", data.name, " - ", data.id);
    onDragOver(event, data.id);
  };


  return (
    <div
      className={`flex items-center space-x-4 mb-4 ${isHovered ? 'mb-16' : ''} ${isDragging ? 'opacity-50' : ''}`}
      draggable={true}
      // Without this "dataTransfer" event, the drag and drop will not work
      onDragStart={ handleDragStart }
      onDragOver={ handleDragOver }
      onDragEnd={(e) => { onDrop(e, data.id)} }
      onDrop={(e) => {
        const dropIndex = e.dataTransfer.getData('text/plain');
        onDrop(e, dropIndex)
      } }
    >
      <button
        className={`w-6 focus:outline-none focus:ring-2 cursor-move`}
      >
        <Bars4Icon className="inline" width={20} />
      </button>
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
      {data.disabledFields?.includes("investment") ? (
        <div className="w-36 px-3 border-b py-2 border-gray-300 dark:border-gray-700">${formatNumberWithCommas(data.investment)}</div>
      ) : (
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
      )}
      {data.disabledFields?.includes("cap") ? (
        <div className="w-36 px-3 border-b py-2 border-gray-300 dark:border-gray-700">${formatNumberWithCommas(Math.round(data.cap))}</div>
      ) : (
      <CurrencyInput
        type="text"
        name="cap"
        value={data.cap}
        onValueChange={onValueChange}
        placeholder="Valuation Cap"
        autoComplete="off"
        className="w-36 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
        prefix="$"
        decimalScale={0}
        allowDecimals={true}
      />
      )}
      {data.disabledFields?.includes("discount") ? (
        <div className="w-28 px-3 border-b py-2 border-gray-300 dark:border-gray-700">{data.discount}%</div>
      ) : (
      <CurrencyInput
        type="text"
        name="discount"
        value={data.discount ?? "0"}
        onValueChange={onValueChange}
        placeholder="Discount %"
        className="w-28 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
        prefix=""
        suffix="%"
        decimalScale={0}
        max={99}
        maxLength={2}
        allowDecimals={false}
      />
      )}
      {data.discount > 99 && <p className="text-red-500">Invalid discount</p>}
      <select
        name="conversionType"
        value={conversionType()}
        onChange={handleDropDownChange}
        className="w-36 px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="post">Post Money</option>
        <option value="pre">Pre Money</option>
        <option value="mfn">Uncapped MFN</option>
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
  onMoveRow,
}) => {

  const [dragStartId, setDragStartId] = useState<string|null>(null);
  const [dragOverId, setDragOverId] = useState<string|null>(null);

  const onDragStart = (_event: React.DragEvent<HTMLDivElement>, index: string) => {
    setDragStartId(index);
  }

  const onDragOver = (_event: React.DragEvent<HTMLDivElement>, index: string) => {
    setDragOverId(index);
  }

  const onDrop = () => {
    if (dragStartId && dragOverId && dragStartId !== dragOverId) {
      onMoveRow?.(dragStartId, dragOverId);
    }
  }

  // Handle issue with dragend event not firing
  useEffect(() => {
    // Add global dragend listener
    const handleGlobalDragEnd = () => {
      setDragOverId(null); // Reset drag over state
      setDragStartId(null); // Reset drag start state
    };

    window.addEventListener('dragend', handleGlobalDragEnd);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  return (
    <div className="not-prose">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-6"> </div>
        <div className="w-48">Name</div>
        <div className="w-36">Investment</div>
        <div className="w-36">Cap</div>
        <div className="w-28">Discount</div>
        <div className="w-36">Type</div>
        <div className="w-24">Ownership %</div>
      </div>

      {rows.map((note, idx) => (
        <SAFEInputRow
          key={idx}
          data={note}
          isDragging={ dragStartId === note.id }
          isHovered={dragOverId === note.id && dragStartId !== note.id}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
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
