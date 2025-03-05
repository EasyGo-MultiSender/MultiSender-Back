// src/services/signature.ts
import { SignatureRequest } from "../models/Csv";
import fs from "fs";
import path from "path";

export const apiService = {
  /**
   * 一括トランザクション送信処理
   * @param data 署名と送信データ
   * @returns 処理結果
   */
  async postSignature(data: SignatureRequest): Promise<void> {
    try {
      
      // 保存先ディレクトリを確認・なければ作成
      const csvDir = await this.getOrMakedirectoryPass(data.senderWallet);

      // ファイル名をウォレットアドレスに基づいて作成（日時を追加して重複防止）
      const fileName = `${data.timeStamp}.csv`; // ファイル名はタイムスタンプ
      const filePath = path.join(csvDir, fileName);

      // CSVヘッダー
      const csvHeader =
        "signature,status,error,error_message,sender_wallet,token_type,token_symbol,time_stamp,uuid,recipient_wallet,amount\n";

      // CSVデータ行を作成
      const csvRows = data.transactions
        .map(({ recipient_wallet, amount }) =>
          [
            data.signature,
            data.status,
            data.error,
            data.errorMessage,
            data.senderWallet,
            data.tokenType,
            data.tokenSymbol,
            data.timeStamp,
            data.uuid,
            recipient_wallet,
            amount,
          ].join(",")
        )
        .join("\n");

      // CSVファイルに書き込み
      await fs.promises.writeFile(filePath, csvHeader + csvRows, "utf8");

      return;
    } catch (error) {
      console.error("Error processing bulk transactions:", error);
      throw new Error(`Failed to process transactions: ${error.message}`);
    }
  },

  async getOrMakedirectoryPass(walletAddress: string): Promise<string> {
    try {
      // 保存先ディレクトリを確認・作成
      const firstChar = walletAddress.charAt(0);
      const csvDir = path.join(process.cwd(), "public", "csv", firstChar, walletAddress);

      // ない場合は再帰的にディレクトリを生成
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
      }

      return csvDir;
    } catch (error) {
      console.error("Error saving CSV file:", error);
      throw new Error(`Failed to save CSV file: ${error.message}`);
    }
  },
};
