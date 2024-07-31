import type { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
  TenK = "Form 10K",
  TenQ = "Form 10Q",
}

export type Ticker = {
  ticker: string;
  fullName: string;
};

export interface SecDocument{
  id:string,
  filename?:string,
  url: string;
  chunk_url?:string,
  type:string,
  color?: DocumentColorEnum;
}
