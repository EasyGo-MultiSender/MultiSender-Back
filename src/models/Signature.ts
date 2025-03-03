
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

export interface SignatureResponse {
  transaction_id: string;
  processed_at: string;
  success: boolean;
  transactions_count: number;
  total_amount: number;
}
