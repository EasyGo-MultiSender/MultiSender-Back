import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import logger from "jet-logger";
import cors from "cors";

import "express-async-errors";

import BaseRouter from "@src/routes";

import Paths from "@src/common/Paths";
import ENV from "@src/common/ENV";
import HttpStatusCodes from "@src/common/HttpStatusCodes";
import { RouteError } from "@src/common/route-errors";
import { NodeEnvs } from "@src/common/constants";

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// プロジェクトルートとパスの設定
const PROJECT_ROOT = ENV.NodeEnv === NodeEnvs.Dev
  ? path.resolve(__dirname, "..")        // 開発環境: /src
  : path.resolve(__dirname, "../.."); // 本番/ステージング環境: /dist/src

const PUBLIC_PATH = path.join(PROJECT_ROOT, "public");

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));
}

// CORS configuration - allow all domains
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Recaptcha-Token"],
  })
);

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "*"],
          connectSrc: ["'self'", "*"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
          styleSrc: ["'self'", "'unsafe-inline'", "*"],
          imgSrc: ["'self'", "data:", "*"],
          fontSrc: ["'self'", "data:", "*"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'", "*"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// 静的ファイルを提供するための設定（public ディレクトリを使用）
app.use(express.static(PUBLIC_PATH));

// CSVファイル専用のルート
app.get("/csv/*", (req, res) => {
  try {
    // ファイル名の検証（ディレクトリトラバーサル対策）
    let requestPath = req.path.slice(5); // "/csv/" の部分を削除

    // Decode URI components to handle encoded characters
    requestPath = decodeURIComponent(requestPath);

    // 先頭のスラッシュを削除して相対パスを確保
    requestPath = requestPath.replace(/^\/+/, "");
    // 危険な文字や不正なパターンを含むパスを拒否
    if (
      requestPath.includes("..") ||
      requestPath.includes("~") ||
      !requestPath.endsWith(".csv") ||
      /[<>:"\\|?*]/.test(requestPath)
    ) {
      res.status(400).send("無効なファイルパスです");
      return;
    }

    // 安全なパス構築
    const csvDir = path.join(PUBLIC_PATH, "csv");
    // 悪意のある..パターンを完全に削除（先頭のスラッシュはすでに削除済み）
    const normalizedPath = path.normalize(requestPath);
    const fullPath = path.join(csvDir, normalizedPath);

    // パスの検証 - csvDirの外にアクセスしようとしていないか確認
    // クロスプラットフォーム対応の改良された検証
    const relativePathParts = path.relative(csvDir, fullPath).split(path.sep);
    if (
      relativePathParts[0] === ".." ||
      !fullPath.startsWith(csvDir + path.sep)
    ) {
      res.status(400).send("無効なファイルパスです");
      return;
    }

    // ファイルの存在確認
    res.sendFile(fullPath);
  } catch (err) {
    logger.err(`CSVファイルアクセスエラー: ${err}`);
    res.status(500).send("サーバーエラーが発生しました");
  }
});

// APIとCSV以外のすべてのリクエストをReactアプリにリダイレクト
app.get("*", (req, res, next) => {
  // APIリクエストはここで処理しない
  if (req.url.startsWith("/api/")) {
    return next();
  }
  // それ以外は全てindex.htmlを返す
  res.sendFile(path.join(PUBLIC_PATH, "index.html"));
});

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
