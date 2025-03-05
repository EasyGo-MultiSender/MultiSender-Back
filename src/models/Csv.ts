export interface Transaction {
  recipient_wallet: string;
  amount: number;
}

export interface SignatureRequest {
  signature: string | null;
  status: string;
  error: string | null;
  errorMessage?: string;
  senderWallet: string;
  tokenType: string;
  tokenSymbol: string;
  tokenMintAddress: string; // 固定値
  timeStamp: number; // unix time
  uuid: string; // どこまでが1transferかを識別するためのID
  transactions: Transaction[];
}
