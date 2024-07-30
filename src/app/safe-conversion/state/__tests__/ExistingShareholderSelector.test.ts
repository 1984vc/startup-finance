import { describe, expect, test } from "@jest/globals";
import { createConversionStore } from "../ConversionState";
import { getRandomData, initialState } from "../initialState";
import { getExistingShareholderPropsSelector } from "../ExistingShareholderSelector";
import { useStore } from "zustand";

describe("Existing Shareholder Selector", () => {
  test("that it passes a basic sanity check", () => {
    const store =  createConversionStore(
      initialState({ ...getRandomData()}),
    );
    console.log(getExistingShareholderPropsSelector(store.getState()))
  });
})
