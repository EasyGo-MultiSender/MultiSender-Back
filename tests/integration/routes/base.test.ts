import supertest from 'supertest';
import app from '@src/server';
import Paths from '@src/common/Paths';
import { SignatureRequest } from '@src/models/Csv';
import fs from 'fs';
import path from 'path';

const request = supertest(app);

describe('API Routes', () => {
  describe('POST /api/signature', () => {
    // テスト後にファイルを削除するための配列
    const createdFiles: string[] = [];

    // 各テスト後のクリーンアップ
    afterEach(async () => {
      // 作成されたファイルを削除
      for (const filePath of createdFiles) {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      }
      createdFiles.length = 0;
    });

    it('should return 204 and save CSV file correctly', async () => {
      const testData: SignatureRequest = {
        uuid: '01957970-37f7-722e-bab7-df781222aaf5',
        signature: "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
        status: 'success',
        error: null,
        senderWallet: 'lsa1Ty43hxFhAMZfKe3CCanDWuD8EJkC6Q2yUj',
        tokenType: 'test-token-type',
        tokenSymbol: 'symbol',
        tokenMintAddress: 'tokenMintAddress',
        timeStamp: '20250210T045040Z',
        transactions: [{
          recipientWallet: '5VTTMMPbgi4SjbKyeXwUvTf7S5VBYCRcqq4eHzV5BmyR',
          amount: 1.0
        },
        {
          recipientWallet: '8KEXsoZYVRgmmXg9qfFnC7dMKjJdZRcfP3ATztR4KR5P',
          amount: 2.654321
        }]
      };

      const response = await request
        .post(`${Paths.Base}/signature`)
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(204);

      // CSVファイルの保存を確認
      const firstChar = testData.senderWallet.charAt(0);
      const csvDir = path.join(process.cwd(), 'public', 'csv', firstChar, testData.senderWallet);
      
      // ディレクトリが作成されていることを確認
      expect(fs.existsSync(csvDir)).toBe(true);

      // ファイルが作成されていることを確認
      const files = await fs.promises.readdir(csvDir);
      const csvFile = files.find(file => file.includes(testData.timeStamp));
      expect(csvFile).toBeDefined();

      if (csvFile) {
        const filePath = path.join(csvDir, csvFile);
        createdFiles.push(filePath); // クリーンアップ用に保存

        // ファイルの内容を確認
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const lines = fileContent.split('\n');

        // ヘッダー行を確認
        expect(lines[0]).toBe('uuid,signature,status,error,error_message,sender_wallet,token_type,token_symbol,token_mint_address,time_stamp,recipient_wallet,amount');

        // データ行を確認
        testData.transactions.forEach((tx, index) => {
          const expectedLine = [
            testData.uuid,
            testData.signature,
            testData.status,
            testData.error,
            testData.errorMessage || '',
            testData.senderWallet,
            testData.tokenType,
            testData.tokenSymbol,
            testData.tokenMintAddress,
            testData.timeStamp,
            tx.recipientWallet,
            tx.amount
          ].join(',');
          expect(lines[index + 1]).toBe(expectedLine);
        });
      }
    });

    it('should return 400 for invalid request - missing required fields', async () => {
      // 一部のフィールドが欠けているデータ
      const invalidData: Partial<SignatureRequest> = {
        uuid: '01957970-37f7-722e-bab7-df781222aaf5',
        signature: "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
        // status が欠けている
        error: null,
        // senderWallet が欠けている
        tokenType: 'test-token-type',
        tokenSymbol: 'symbol',
        tokenMintAddress: 'tokenMintAddress',
        timeStamp: '20250210T045040Z',
        transactions: [{
          recipientWallet: '5VTTMMPbgi4SjbKyeXwUvTf7S5VBYCRcqq4eHzV5BmyR',
          amount: 1.0
        }]
      };

      const response = await request
        .post(`${Paths.Base}/signature`)
        .send(invalidData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: '無効なリクエストです' });
    });

    it('should return 400 for invalid request - empty transactions', async () => {
      const invalidData: SignatureRequest = {
        uuid: '01957970-37f7-722e-bab7-df781222aaf5',
        signature: "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
        status: 'success',
        error: null,
        senderWallet: 'lsa1Ty43hxFhAMZfKe3CCanDWuD8EJkC6Q2yUj',
        tokenType: 'test-token-type',
        tokenSymbol: 'symbol',
        tokenMintAddress: 'tokenMintAddress',
        timeStamp: '20250210T045040Z',
        transactions: [] // 空の配列
      };

      const response = await request
        .post(`${Paths.Base}/signature`)
        .send(invalidData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: '無効なリクエストです' });
    });

    it('should return 400 for invalid request - invalid transaction data', async () => {
      const invalidData: SignatureRequest = {
        uuid: '01957970-37f7-722e-bab7-df781222aaf5',
        signature: "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
        status: 'success',
        error: null,
        senderWallet: 'lsa1Ty43hxFhAMZfKe3CCanDWuD8EJkC6Q2yUj',
        tokenType: 'test-token-type',
        tokenSymbol: 'symbol',
        tokenMintAddress: 'tokenMintAddress',
        timeStamp: '20250210T045040Z',
        transactions: [{
          recipientWallet: '', // 無効なウォレットアドレス
          amount: -1 // 無効な金額
        }]
      };

      const response = await request
        .post(`${Paths.Base}/signature`)
        .send(invalidData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: '無効なリクエストです' });
    });
  });
}); 