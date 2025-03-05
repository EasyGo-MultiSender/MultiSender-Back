import express from 'express';
import { apiService } from '../util/csv';

const router = express.Router();

// APIエンドポイントを定義
router.post('/signature', async (req, res) => {
  try {
    const response = await apiService.uploadCsv(req.body); // あとで変更する
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;