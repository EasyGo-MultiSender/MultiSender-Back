
export interface Transaction {
  recipient_wallet: string;
  amount: number;
}

export interface SignatureRequest {
  signature: string;
  senderWallet: string;
  timeStamp : string;
  tokenMintAddress: string;
  transactions: Transaction[];
}
