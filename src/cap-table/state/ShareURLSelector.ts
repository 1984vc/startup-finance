import { compressState } from "@/utils/stateCompression";
import { createSelector } from "reselect";
import { IConversionStateData } from "./ConversionState";

export const getShareUrl = createSelector(
  (state: IConversionStateData) => state,
  ( state ): string => {
    const url = window.location.href.replace(/#$/, '')
    return url + "#" +compressState(state)
  })