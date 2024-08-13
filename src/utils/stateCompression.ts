import { compressToBase64, decompressFromBase64 } from "lz-string";

// Allow for future changes to state compression and rehydration
const VERSION_MAGIC_CODE = "AA";

const encodeURLSafeBase64 = (str: string): string => {
  // Replace characters that are not URL safe
  // Use `.` for `+` because it doesn't wrap in a text editor
  return str.replace(/\//g, "_").replace(/\+/g, ".").replace(/=/g, "");
};

const decodeURLSafeBase64 = (str: string): string => {
  return str.replace(/_/g, "/").replace(/-/g, "+").replace(/\./g, "+");
};

const decodeVersionMagicCode = (
  b64: string,
): [version: number, b64: string] => {
  const version = new Uint8Array(atob(b64.slice(0, 2)).split('').map((char) => char.charCodeAt(0)))[0];
  const b64str = decodeURLSafeBase64(b64.slice(2));
  return [version, b64str];
};

export const compressState = (state: any): string => {
  const hash = compressToBase64(JSON.stringify(state));
  return encodeURLSafeBase64(`${VERSION_MAGIC_CODE}${hash}`);
};

export const decompressState = (str: string): any => {
  const [_version, b64str] = decodeVersionMagicCode(str);
  // for now, do nothing with the version
  const stateBuffer = decompressFromBase64(b64str);
  const stateJSON = JSON.parse(stateBuffer.toString());
  return stateJSON;
};
