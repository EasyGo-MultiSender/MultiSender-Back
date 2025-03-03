// src/services/signature.ts
import { SignatureRequest, SignatureResponse } from '../models/Signature';
import fs from 'fs';
import path from 'path';

export const apiService = {
  /**
   * 一括トランザクション送信処理
   * @param data 署名と送信データ
   * @returns 処理結果
   */
  async postSignature(data: SignatureRequest): Promise<SignatureResponse> {
    try {
      // トランザクションの合計金額を計算
      const totalAmount = data.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      // CSVファイル保存処理
      await this.saveTransactionsToCSV(data);
      
      // 成功レスポンスを返す
      return {
        transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        processed_at: new Date().toISOString(),
        success: true,
        transactions_count: data.transactions.length,
        total_amount: totalAmount
      };
    } catch (error) {
      console.error('Error processing bulk transactions:', error);
      throw new Error(`Failed to process transactions: ${error.message}`);
    }
  },

  /**
   * トランザクションデータをCSVとして保存
   * @param data 署名と送信データ
   */
  async saveTransactionsToCSV(data: SignatureRequest): Promise<void> {
    try {
      // 保存先ディレクトリを確認・作成
      const csvDir = path.join(process.cwd(), 'public', 'csv');
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
      }

      // ファイル名をウォレットアドレスに基づいて作成（日時を追加して重複防止）
      const fileName = `${data.sender_wallet}_${Date.now()}.csv`;
      const filePath = path.join(csvDir, fileName);

      // CSVヘッダー
      const csvHeader = 'recipient_wallet,amount,token_mint_address,signature\n';
      
      // CSVデータ行を作成
      const csvRows = data.transactions.map(tx => 
        `${tx.recipient_wallet},${tx.amount},${data.token_mint_address},${data.signature}`
      ).join('\n');

      // CSVファイルに書き込み
      await fs.promises.writeFile(filePath, csvHeader + csvRows, 'utf8');
      
    } catch (error) {
      console.error('Error saving CSV file:', error);
      throw new Error(`Failed to save CSV file: ${error.message}`);
    }
  }
};