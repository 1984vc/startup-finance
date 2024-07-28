import { compressToBase64, decompressFromBase64 } from "lz-string";

// Allow for future changes to state compression and rehydration
const VERSION = 0;

const encodeURLSafeBase64 = (str: string): string => {
  // Replace characters that are not URL safe
  // Use `.` for `+` because it doesn't wrap in a text editor
  return str.replace(/\//g, "_").replace(/\+/g, ".");
};

const decodeURLSafeBase64 = (str: string): string => {
  return str.replace(/_/g, "/").replace(/-/g, "+").replace(/\./g, "+");
};

const encodeVersionMagicCode = (version: number): string => {
  return Buffer.from([0, version]).toString("base64").slice(0, 2);
};

const decodeVersionMagicCode = (
  b64: string,
): [version: number, b64: string] => {
  const version = Buffer.from(`${b64.slice(0, 2)}`, "base64").readUInt8(0);
  const b64str = decodeURLSafeBase64(b64.slice(2));
  return [version, b64str];
};

export const compressState = (state: any): string => {
  const hash = compressToBase64(JSON.stringify(state));
  const versionMagicCode = encodeVersionMagicCode(VERSION);
  return encodeURLSafeBase64(`${versionMagicCode}${hash}`);
};

export const decompressState = (str: string): any => {
  const [_version, b64str] = decodeVersionMagicCode(str);
  // for now, do nothing with the version
  const stateBuffer = decompressFromBase64(b64str);
  const stateJSON = JSON.parse(stateBuffer.toString());
  return stateJSON;
};
