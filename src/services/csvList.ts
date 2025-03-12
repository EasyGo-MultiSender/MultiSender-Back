import fs from "fs";
import path from "path";

export const csvListService = {
  /**
   * 指定されたウォレットアドレスに関連するCSVファイルの一覧を取得
   * @param walletAddress ウォレットアドレス
   * @returns CSVファイルの一覧
   */
  async listCsvFiles(walletAddress: string): Promise<string[]> {
    try {
      const firstChar = walletAddress.charAt(0);
      const csvDir = path.join(process.cwd(), "public", "csv", firstChar, walletAddress);

      if (!fs.existsSync(csvDir)) {
        return [];
      }

      const files = await fs.promises.readdir(csvDir);
      return files;
    } catch (error) {
      console.error("Error listing CSV files:", error);
      throw new Error(`Failed to list CSV files: ${error.message}`);
    }
  },
};