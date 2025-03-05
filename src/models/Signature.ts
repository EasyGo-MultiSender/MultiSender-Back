
export interface Transaction {
  recipient_wallet: string;
  amount: number;
}

export interface SignatureRequest {
  signature: string;
  senderWallet: string;
  timeStamp : number;
  tokenMintAddress: string;
  transactions: Transaction[];
}
