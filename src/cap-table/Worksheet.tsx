import React, { useState } from "react";
import CurrencyInput from "react-currency-input-field";

import {
  getPricedConversion,
  IConversionState,
  SeriesState,
} from "@/cap-table/state/ConversionState";
import ExisingShareholderList from "@/components/safe-conversion/Conversion/ExistingShareholders";
import PricedRound from "@/components/safe-conversion/Conversion/PricedRound";
import SeriesInvestorList from "@/components/safe-conversion/Conversion/SeriesInvestorList";
import { stringToNumber } from "@/utils/numberFormatting";
import { getExistingShareholderPropsSelector } from "@/cap-table/state/ExistingShareholderSelector";
import { getSAFERowPropsSelector } from "@/cap-table/state/SAFESelector";
import { getSeriesPropsSelector } from "@/cap-table/state/SeriesSelector";
import SafeNoteList from "@/components/safe-conversion/Conversion/SafeNoteList";
import { getPriceRoundPropsSelector } from "@/cap-table/state/PricedRoundSelector";
import Share from "@/components/safe-conversion/Conversion/Share";
import { CapTableResults } from "@/components/safe-conversion/Conversion/CapTableResults";
import { getPricedRoundCapTablePropsSelector, getSafeCapTablePropsSelector } from "@/cap-table/state/CapTableSelector";
import { getShareUrl } from "./state/ShareURLSelector";
import { getErrorSelector } from "./state/ErrorSelector";
import Finder from "@/components/safe-conversion/Conversion/Finder";
import { FolderPlusIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

type WorksheetProps = {
  conversionState: IConversionState;
  id: string
} 

const Worksheet: React.FC<WorksheetProps> = ({conversionState, id}) => {

  const {
    rowData,
    preMoney,
    targetOptionsPool,
    onAddRow,
    onDeleteRow,
    onUpdateRow,
    onValueChange,
    togglepriceRounds
  } = conversionState;

  const totalSeriesInvesment = (
    rowData.filter((row) => row.type === "series") as SeriesState[]
  )
    .map((row) => row.investment)
    .reduce((acc, val) => acc + val, 0);

  const postMoney = stringToNumber(preMoney) + totalSeriesInvesment;
  const pricedConversion = getPricedConversion(conversionState);

  const [preMoneyChange, updatePreMoneyChange] = useState(0);
  const [investmentChange, updateInvestmentChange] = useState(0);

  const errors = getErrorSelector(conversionState);
  
  // Future plans to add more priced rounds. Right now, used to show or hider the priced rounds
  const pricedRounds = conversionState.pricedRounds ?? 0;
  console.log("pricedRounds", pricedRounds);

  return (
    <div className={"not-prose"}>
      <div className="w-full flex justify-end gap-2">
        <Share url={getShareUrl(conversionState)}></Share>
        <Finder currentId={id}></Finder>
        <a
          href="#new"
          className={`w-24 px-4 text-center cursor-pointer py-2 rounded-md focus:outline-none focus:ring-2 text-white bg-nt84blue hover:bg-nt84bluedarker inline`}
        >
          New <FolderPlusIcon className="inline" width={20} />
        </a>
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-5">1) Existing Cap Table</h1>
      <div>
        <ExisingShareholderList
          rows={getExistingShareholderPropsSelector(conversionState)}
          onAddRow={() => onAddRow("common")}
          onDelete={onDeleteRow}
          onUpdate={(data) => {
            if (data.id === "UnusedOptionsPool") {
              onValueChange("number")(data.shares.toString(), "unusedOptions");
            } else {
              onUpdateRow(data)
            }
          }}
        />
      </div>
      <h1 className="text-1xl font-bold mb-4 mt-8">2) SAFE Investors</h1>
      <div>
        <SafeNoteList
          rows={getSAFERowPropsSelector(conversionState)}
          onAddRow={() => onAddRow("safe")}
          onDelete={onDeleteRow}
          onUpdate={onUpdateRow}
        />
      </div>

      <div className="pt-10">
        <h2 className="text-lg font-bold mb-4 inline not-prose">
          Cap Table Before Priced Round
        </h2>
        <p>This assumes that all our SAFE's convert at their Cap</p>
        <CapTableResults
          {...getSafeCapTablePropsSelector({
            ...conversionState,
          })}
        />
      </div>

      <button
        className={`w-64 px-4 text-center cursor-pointer mt-4 py-2 rounded-md focus:outline-none focus:ring-2 text-white bg-nt84blue hover:bg-nt84bluedarker inline`}
        onClick={() => togglepriceRounds()}
      >
        <span className="inline">
          { pricedRounds === 0 ? "Show Priced Round" : "Hide Priced Round"}
          { pricedRounds === 0 ?
            <PlusCircleIcon className="inline ml-2" width={20}></PlusCircleIcon> :
            <MinusCircleIcon className="inline ml-2" width={20}></MinusCircleIcon>
          }
        </span>
      </button>
      { pricedRounds > 0  &&
        <div>
          <div>
            <h1 className="text-1xl font-bold mb-4 mt-8">3) New Round </h1>
            <div className="flex space-x-4 ml-10">
              <div className="flex-1">
                <h2 className="my-2 not-prose">Premoney Valuation</h2>
                <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                  <CurrencyInput
                    type="text"
                    name="preMoney"
                    value={preMoney}
                    onValueChange={onValueChange("number")}
                    placeholder="Investment"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    prefix="$"
                    decimalScale={0}
                    allowDecimals={false}
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="my-2 not-prose">Post Money Valuation</h2>
                <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                  <CurrencyInput
                    type="text"
                    name="totalSeriesInvestment"
                    value={postMoney}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-inherit border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    prefix="$"
                    decimalScale={0}
                    allowDecimals={false}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-4 ml-10">
              <div className="flex-1">
                <h2 className="my-2 not-prose">Target Options Pool</h2>
                <CurrencyInput
                  type="text"
                  name="targetOptionsPool"
                  value={targetOptionsPool}
                  onValueChange={onValueChange("percent")}
                  placeholder="Target Options Pool %"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  prefix=""
                  suffix="%"
                  decimalScale={1}
                  max={99}
                  allowDecimals={true}
                />
              </div>
              <div className="flex-1">
                <h2 className="my-2 not-prose">Additional Options</h2>
                <CurrencyInput
                  type="text"
                  name="additionalOptions"
                  value={pricedConversion?.additionalOptions}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-inherit border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  prefix=""
                  decimalScale={0}
                  max={99}
                  maxLength={2}
                  allowDecimals={false}
                  disabled={true}
                />
              </div>
            </div>
            <h1 className="text-1xl font-bold mb-4 mt-5">3a) Series Investors</h1>
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
              <SeriesInvestorList
                rows={getSeriesPropsSelector(conversionState)}
                onAddRow={() => onAddRow("series")}
                onDelete={onDeleteRow}
                onUpdate={onUpdateRow}
              />
            </div>
          </div>
          <div className="pt-10">
            <h2 className="text-2xl font-bold mb-4 not-prose">Priced Round Overview</h2>
            {errors.safeError && <p className="text-red-500 text-xl">SAFE Conversion Error</p>}
            {!errors.safeError &&
              <div>
                <PricedRound
                  {...getPriceRoundPropsSelector({
                    ...conversionState,
                    preMoneyChange,
                    investmentChange,
                  })}
                  updateInvestmentChange={updateInvestmentChange}
                  updatePreMoneyChange={updatePreMoneyChange}
                />
                <h2 className="text-lg font-bold mb-4 mt-8 not-prose">
                  Cap Table after Priced Round
                </h2>
                <CapTableResults
                  {...getPricedRoundCapTablePropsSelector({
                    ...conversionState,
                    preMoneyChange,
                    investmentChange,
                  })}
                />
              </div>
            }
          </div>
        </div>
      }
    </div>
  );
};

export default Worksheet