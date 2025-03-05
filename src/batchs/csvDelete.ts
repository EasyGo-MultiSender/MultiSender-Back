import * as fs from 'fs';
import * as path from 'path';
import { subMonths } from 'date-fns';

// CSVファイルが格納されているディレクトリのパスを設定してください
const CSV_DIR = path.join(process.cwd() , 'public', 'csv');

function isOlderThanThreeMonths(fileName: string): boolean {
  // 拡張子を除いた部分を取得
  const baseName = fileName.replace('.csv', '').split('_')[0];

   // 正規表現でファイル名が期待する形式かチェック
   const regex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/;
   const match = baseName.match(regex);
 
   if (!match) {
     console.error(`ファイル名 "${fileName}" は期待される形式 (YYYYMMDDTHHmmssZ) ではありません。`);
     return false;
   }

    // ISO8601形式の文字列に変換 "YYYY-MM-DDTHH:mm:ssZ"
  const isoString = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`;
  const fileDate = new Date(isoString);

  // 日付が不正な場合のチェック
  if (isNaN(fileDate.getTime())) {
    console.error(`ファイル名 "${fileName}" の日付部分が不正です: ${isoString}`);
    return false;
  }
  
  const now = new Date();
  const threeMonthsAgo = subMonths(now, 3);
  
  return fileDate < threeMonthsAgo;
}

/**
 * 指定されたディレクトリを再帰的に走査し、CSVファイルをチェックして削除する
 */
function deleteOldCsvFilesInDir(dir: string): void {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`ディレクトリの読み込みエラー (${dir}):`, err);
        return;
      }
  
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`ファイル情報取得エラー (${filePath}):`, err);
            return;
          }
  
          if (stats.isDirectory()) {
            // ディレクトリの場合は再帰的に処理
            deleteOldCsvFilesInDir(filePath);
          } else if (file.endsWith('.csv')) {
            if (isOlderThanThreeMonths(file)) {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(`ファイル削除エラー (${filePath}):`, err);
                } else {
                  console.log(`削除されたファイル: ${filePath}`);
                }
              });
            }
          }
        });
      });
    });
  }

// スクリプト実行時に削除処理を開始
deleteOldCsvFilesInDir(CSV_DIR);
