import { Request, Response, NextFunction } from "express";
import { RouteError } from "@src/common/route-errors";
import HttpStatusCodes from "@src/common/HttpStatusCodes";
import axios from "axios";
import ENV from "@src/common/ENV";

// reCAPTCHAのAPIレスポンス型定義
type RecaptchaResponse = {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
};

// reCAPTCHAのリクエスト型定義
export interface RecaptchaVerifyRequest {
  token: string;
  action: string;
}

// reCAPTCHAの検証結果レスポンス型定義
export interface RecaptchaVerifyResponse {
  success: boolean;
  error?: string;
}

// Expressのリクエストオブジェクトを拡張
declare global {
  namespace Express {
    interface Request {
      recaptcha?: {
        score: number;
        action?: string;
      };
    }
  }
}

/**
 * reCAPTCHAトークンを検証するミドルウェア
 */
export const verifyRecaptcha = async (
  req: Request<any, any, RecaptchaVerifyRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    // リクエストボディまたはヘッダーからトークンを取得
    const token = req.body.token || (req.headers["x-recaptcha-token"] as string);
    const { action } = req.body as RecaptchaVerifyRequest;

    if (!token) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "reCAPTCHA token is required");
    }

    // actionの検証（オプショナル）
    if (action && action !== "transfer") {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid action type");
    }

    // reCAPTCHA APIにトークンを検証するリクエストを送信
    const response = await axios.post<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: ENV.RecaptchaSecretKey,
          response: token,
        },
      }
    );

    const { success, score } = response.data;

    if (!success) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "reCAPTCHA verification failed");
    }

    // 検証結果をリクエストオブジェクトに設定
    req.recaptcha = { score, action };

    next();
  } catch (error) {
    if (error instanceof RouteError) {
      next(error);
    } else {
      console.error("reCAPTCHA verification error:", error);
      next(new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, "reCAPTCHA verification failed"));
    }
  }
};

/**
 * reCAPTCHAスコアを確認するミドルウェア
 */
export const checkRecaptchaScore = (req: Request, res: Response, next: NextFunction) => {
  if (!req.recaptcha) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "reCAPTCHA verification failed");
  }

  const score = req.recaptcha.score;
  // 環境変数から閾値を取得（デフォルト値は0.5）
  const threshold = ENV.RecaptchaScoreThreshold || 0.5;

  if (score < threshold) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, "reCAPTCHA score is too low");
  }

  next();
};
