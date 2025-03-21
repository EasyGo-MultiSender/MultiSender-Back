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

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));

  // Add CORS for development environment only
  app.use(
    cors({
      origin: "http://localhost:5173", // Allow requests from the frontend development server
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Recaptcha-Token"],
    })
  );
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// 静的ファイルを提供するための設定（public ディレクトリを使用）
app.use(express.static("public"));

// CSVファイル専用のルート
app.get("/csv/*", (req, res) => {
  // /csvで始まるパスへのリクエストはpublic/csvディレクトリのファイルを直接提供
  const csvPath = path.normalize(req.path.slice(5));
  const csvDir = path.join(__dirname, "../public/csv");
  const fullPath = path.join(csvDir, csvPath);

  // fullPathがcsvDirの中にあるか確認
  if (!fullPath.startsWith(csvDir)) {
    res.status(400).send("Invalid path");
    return;
  }

  res.sendFile(fullPath);
});

// APIとCSV以外のすべてのリクエストをReactアプリにリダイレクト
app.get("*", (req, res, next) => {
  // APIリクエストはここで処理しない
  if (req.url.startsWith("/api/")) {
    return next();
  }

  // それ以外のリクエストはindex.htmlを返す
  res.sendFile(path.join(__dirname, "../public", "index.html"));
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
