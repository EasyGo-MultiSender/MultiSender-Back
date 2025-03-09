import express from 'express';
import { apiService } from '../services/csv';
import { SignatureRequest } from '../models/Csv';
import { ValidationErr } from '../common/route-errors';

const router = express.Router();

// APIエンドポイントを定義
router.post('/signature', async (req, res) => {
  try {
    const data = req.body as SignatureRequest;
    
    // すべてのフィールドの必須チェック
    if (!data.uuid || !data.signature || !data.status || data.error === undefined ||
        !data.senderWallet || !data.tokenType || !data.tokenSymbol || 
        !data.tokenMintAddress || !data.timeStamp || !Array.isArray(data.transactions)) {
      console.log('data', data);
      throw new ValidationErr({
        message: '無効なリクエストです'
      });
    }

    // トランザクションの中身のバリデーション
    if (data.transactions.length === 0) {
      console.log('data.transactions.length === 0');
      throw new ValidationErr({
        message: '無効なリクエストです'
      });
    }

    for (const tx of data.transactions) {
      if (!tx.recipientWallet || typeof tx.amount !== 'number' || tx.amount <= 0) {
        console.log('tx', tx);
        throw new ValidationErr({
          message: '無効なリクエストです'
        });
      }
    }

    await apiService.uploadCsv(data);
    res.status(204).end();
  } catch (error) {
    if (error instanceof ValidationErr) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error('Signature processing error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router;