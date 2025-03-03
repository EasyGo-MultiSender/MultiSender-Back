import express from 'express';
import { apiService } from '../services/signature';

const router = express.Router();

// APIエンドポイントを定義
router.post('/signature', async (req, res) => {
  try {
    const response = await apiService.postSignature(req.body);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;