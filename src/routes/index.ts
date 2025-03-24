import express, { Request, Response } from "express";
import { apiService } from "../services/csv";
import { csvListService } from "../services/csvList";
import { SignatureRequest } from "../models/Csv";
import { ValidationErr } from "../common/route-errors";
import {
  verifyRecaptcha,
  RecaptchaVerifyRequest,
  RecaptchaVerifyResponse,
  checkRecaptchaScore,
} from "@src/middleware/recaptcha";

const router = express.Router();

// APIエンドポイントを定義
// CSVファイル一覧を取得
router.get("/csv/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      throw new ValidationErr({
        message: "ウォレットアドレスは必須です",
      });
    }

    const files = await csvListService.listCsvFiles(walletAddress);
    res.json({ files });
  } catch (error) {
    if (error instanceof ValidationErr) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error("CSV listing error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// reCAPTCHA検証用エンドポイント
router.post(
  "/recaptcha/verify",
  verifyRecaptcha,
  checkRecaptchaScore,
  (req: Request, res: Response): void => {
    try {
      const { token } = req.body as RecaptchaVerifyRequest;

      // 検証成功
      const response: RecaptchaVerifyResponse = {
        success: true,
      };
      res.json(response);
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      const response: RecaptchaVerifyResponse = {
        success: false,
        error: "Internal Server Error",
      };
      res.status(500).json(response);
    }
  }
);

router.post("/signature", async (req, res) => {
  try {
    const data = req.body as SignatureRequest;

    // すべてのフィールドの必須チェック
    if (
      !data.uuid ||
      !data.status ||
      !data.senderWallet ||
      !data.tokenType ||
      !data.timeStamp ||
      !Array.isArray(data.transactions)
    ) {
      console.log("data", data);
      throw new ValidationErr({
        message: "無効なリクエストです",
      });
    }

    // トランザクションの中身のバリデーション
    if (data.transactions.length === 0) {
      console.log("data.transactions.length === 0");
      throw new ValidationErr({
        message: "無効なリクエストです",
      });
    }

    for (const tx of data.transactions) {
      if (!tx.recipientWallet || typeof tx.amount !== "number" || tx.amount <= 0) {
        console.log("tx", tx);
        throw new ValidationErr({
          message: "無効なリクエストです",
        });
      }
    }

    await apiService.uploadCsv(data);
    res.status(204).end();
  } catch (error) {
    if (error instanceof ValidationErr) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error("Signature processing error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

export default router;
