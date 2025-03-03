
export interface Transaction {
  recipient_wallet: string;
  amount: number;
}

export interface SignatureRequest {
  signature: string;
  sender_wallet: string;
  token_mint_address: string;
  transactions: Transaction[];
}
