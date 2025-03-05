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

      // CSVデータ行を作成
      const csvRows = data.transactions
        .map(({ recipientWallet, amount }) =>
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
            recipientWallet,
            amount,
          ].join(",")
        )
        .join("\n");

      await fs.promises.appendFile(filePath, csvRows, "utf8");

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

      const targetTime = CsvFileTimeStampToISO(timeStamp);

      const oneMinute = 60 * 1000; // 誤差一分のファイルを全て取得する

      const matchingFiles = files.filter((file) => {
        const [fileTimeStr, fileShortUuid] = file.replace(".csv", "").split("_");

        const fileTime = CsvFileTimeStampToISO(fileTimeStr);

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
      const uuidPrefix = uuid.substring(0, 4); // 前六文字をファイル名に付ける

      const timeStampStr = ToCsvFileTimeStamp(timeStamp)
      const newFilePath = path.join(csvDir, `${timeStamp}_`, `${uuidPrefix}.csv`);
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

const ToCsvFileTimeStamp = (timeStamp: string): string => {
  const date = new Date(timeStamp);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}Z`;
};

// 計算するために2014-10-10T04:50:40Z に変換する.

const CsvFileTimeStampToISO = (csvTimeStamp: string) => {
  const isoString = csvTimeStamp.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  return new Date(isoString).getTime();
};
