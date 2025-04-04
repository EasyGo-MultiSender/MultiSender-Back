# <p align="center">EasyGo Multisender Back</p>
### <p align="center">The New Standard for Fast, Low-Cost Solana Airdrops</p>
[![Test](https://github.com/pj-guzen/BulkSender-Back/actions/workflows/test.yml/badge.svg)](https://github.com/pj-guzen/BulkSender-Back/actions/workflows/test.yml)
[![Test Deploy](https://github.com/pj-guzen/BulkSender-Back/actions/workflows/test_deploy.yml/badge.svg)](https://github.com/pj-guzen/BulkSender-Back/actions/workflows/test_deploy.yml)

EasyGo Multisenderは複数の宛先に一括でトークン送信するためのバックエンドサービスです。送信トランザクションの詳細を受け取り、CSVファイルとして保存します。

## 機能概要

- トランザクション情報のCSV保存
- ウォレットアドレスごとのCSV管理
- 古いCSVファイルの自動削除（3ヶ月以上経過したもの）
- REST APIによるトランザクション情報の送信

## 技術スタック

- **言語**: TypeScript / JavaScript
- **フレームワーク**: Express.js
- **開発環境**: Node.js (v16以上)
- **その他の主要ライブラリ**:
  - date-fns: 日付の操作
  - helmet: セキュリティ対策
  - cors: クロスオリジンリクエスト対応
  - jet-logger: ログ出力

## ディレクトリ構成

```
.
├── config/               - 環境設定ファイル
├── src/
│   ├── batchs/           - バッチ処理（古いCSVファイル削除など）
│   ├── common/           - 共通設定（パス、ステータスコード等）
│   ├── model/            - データモデル定義
│   ├── routes/           - APIエンドポイント定義
│   ├── services/         - ビジネスロジック
│   └── util/             - ユーティリティ関数
├── public/
│   └── csv/              - 保存されたCSVファイル
└── tests/                - テストファイル
```

## 環境設定

環境ごとに異なる設定を使用できます：

- 開発環境: `config/.env.development`
- ステージング環境: `config/.env.staging`
- 本番環境: `config/.env.production`

## インストールと実行

### 必要条件

- Node.js v16.0.0以上
- npm

### インストール

```bash
npm install
```

### 開発モードで実行

```bash
npm run dev
```

ホットリロード対応の開発モード：

```bash
npm run dev:hot
```

### ビルドと本番実行

```bash
npm run build
npm run prod  # 本番環境で実行
npm run stg   # ステージング環境で実行
```

## API仕様

### POST /api/signature

トランザクション情報を受け取り、CSVファイルとして保存します。

#### リクエスト例

```json
{
  "signature": "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
  "senderWallet": "3bJP1Thy43hxFhAMZfPKeu3CCanDWuD8EJkC6Q2yUj",
  "status": "success",
  "error": null,
  "errorMessage": "errorMessage",
  "tokenType": "tokenType",
  "tokenSymbol": "symbol",
  "tokenMintAddress": "So11111111111111111111111111111111111111111",
  "timeStamp": "20141010T045040Z",  // ISO 8601形式で指定
  "uuid": "strng",
  "transactions": [
    {
      "recipientWallet": "5VTTMMPbgi4SjbKyeXwUvTf7S5VBYCRcqq4eHzV5BmyR",
      "amount": 2.999999
    },
    {
      "recipientWallet": "8KEXsoZYVRgmmXg9qfFnC7dMKjJdZRcfP3ATztR4KR5P",
      "amount": 2.654321
    }
  ]
}
```

#### CSV保存ファイル管理

- CSVは `public/csv/[ウォレットアドレスの先頭文字]/[ウォレットアドレス]/` ディレクトリに保存
- ファイル名: `[タイムスタンプ]_[UUID接頭辞].csv`
- 3ヶ月以上経過したCSVファイルは自動的に削除

## テスト

```bash
npm test               # テスト実行
npm run test:watch     # ウォッチモードでテスト
npm run test:coverage  # カバレッジ付きでテスト
```
