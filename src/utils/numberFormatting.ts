export const stringToNumber = (value: string | number): number => {
  if (typeof value === "number") {
    return value;
  } else {
    // Remove anything that's not a digit or a period
    const cleanedValue = value.replace(/[^\d.]/g, "");
    // if it has a period, parseFloat, otherwise parseInt
    return cleanedValue.includes(".")
      ? parseFloat(cleanedValue)
      : parseInt(cleanedValue, 10);
  }
};

export const formatUSDWithCommas = (value: number | string) => {
  if (typeof value === "string") {
    value = stringToNumber(value);
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatNumberWithCommas = (value: number | string) => {
  if (typeof value === "string") {
    value = stringToNumber(value);
  }
  return value.toLocaleString("en-US", {
    style: "decimal",
  });
};
