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
  async uploadCsv(data: SignatureRequest): Promise<void> {
    try {
      // 保存先ディレクトリを確認・なければ作成
      const filePath = await this.getOrMakeFilePass(data.senderWallet, data.timeStamp, data.uuid);

      // ファイル名をウォレットアドレスに基づいて作成（日時を追加して重複防止）
      const fileName = `${data.timeStamp}.csv`; // ファイル名はタイムスタンプ

      // CSVデータ行を作成
      const csvRows = data.transactions
        .map(({ recipient_wallet, amount }) =>
          [
            data.uuid,
            data.signature,
            data.status,
            data.error,
            data.errorMessage,
            data.senderWallet,
            data.tokenType,
            data.tokenSymbol,
            data.timeStamp,
            recipient_wallet,
            amount,
          ].join(",")
        )
        .join("\n");

      // CSVファイルに書き込み
      await fs.promises.writeFile(filePath,  csvRows, "utf8");

      return;
    } catch (error) {
      console.error("Error processing bulk transactions:", error);
      throw new Error(`Failed to process transactions: ${error.message}`);
    }
  },

  async getOrMakeFilePass(walletAddress: string, timeStamp: string, uuid: string): Promise<string> {
    try {
      // 保存先ディレクトリを確認・作成
      const firstChar = walletAddress.charAt(0);
      const csvDir = path.join(process.cwd(), "public", "csv", firstChar, walletAddress);

      // ない場合は再帰的にディレクトリを生成
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
      }

      const files = await fs.promises.readdir(csvDir);

      const targetTime = new Date(timeStamp).getTime();
      const oneMinute = 60 * 1000; // 誤差一分のファイルを全て取得する

      const matchingFiles = files.filter((file) => {
        const fileTime = new Date(file.replace(".csv", "")).getTime();
        return Math.abs(fileTime - targetTime) <= oneMinute;
      });

      // ファイルの中身を確認してuuidが一致するかどうかをチェック
      for (const file of matchingFiles) {
        const filePath = path.join(csvDir, file);
        const fileContent = await fs.promises.readFile(filePath, "utf8");
        const lines = fileContent.split("\n");

        // CSVのヘッダーをスキップして2行目を解析
        if (lines.length > 1) {
          const line = lines[1];
          if (line.trim() !== "") {
            const columns = line.split(",");
            const fileUuid = columns[0]; // uuidは1番目のカラムにあると仮定

            if (fileUuid === uuid) {
              return filePath;
            }
          }
        }
      }

      // 一致するファイルがない場合は新規作成
      const newFilePath = path.join(csvDir, `${timeStamp}.csv`);
      const csvHeader =
        "uuid,signature,status,error,error_message,sender_wallet,token_type,token_symbol,time_stamp,recipient_wallet,amount\n";
      await fs.promises.writeFile(newFilePath, csvHeader, "utf8"); // ヘッダーを書き込んで空のファイルを作成

      return newFilePath;
    } catch (error) {
      console.error("Error saving CSV file:", error);
      throw new Error(`Failed to save CSV file: ${error.message}`);
    }
  },
};
