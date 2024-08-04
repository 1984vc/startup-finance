import { BestFit } from "@/library/safe_conversion";

export interface RowsProps<T> {
  rows: T[];
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onUpdate: (data: T) => void;
  pricedConversion: BestFit | undefined;
}
