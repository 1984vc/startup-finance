import { compressState } from "@/utils/stateCompression";
import { createSelector } from "reselect";
import { IConversionStateData } from "./ConversionState";
import { getSerializedSelector } from "./SerializeSelector";


export const getShareUrl = createSelector(
  (state: IConversionStateData) => state,
  ( state ): string => {
    const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
    return url + "#" +compressState(getSerializedSelector(state))
  })