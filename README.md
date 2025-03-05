# bulksender-backend

## ディレクトリ構成

### src/common

パスの設定やステータスコードの設定が諸々書いてある。さわっていない

### src/model

型の定義が書いてある。

### src/service

apiの処理の部分を書いてある。csv保存などのロジックはここ

### src/routes

エンドポイントの設定を書いてある。今回は一つしかない。

### public

現状はcsvが保存してある。

## 使用方法

まず、`npm install`を実行して依存関係をインストールしてください。

その後、`npm run dev`を実行してサーバーを起動してください。

## API

現在は`http://localhost:3000/api/signature`にPOSTリクエストを送ることで、csvのpostリクエストを送ることが出来ます

### POST /api/signature

現状は以下のようですが、変更する可能性がかなりあります。

#### Request

```json
{
  "signature": "example_signature",
  "sender_wallet": "abasoifha",
  "token_mint_address": "example_token_mint_address",
  "timeStamp" : "number";
  "transactions": [
    {
      "recipient_wallet": "recipient_wallet_1",
      "amount": 100
    },
    {
      "recipient_wallet": "recipient_wallet_2",
      "amount": 200
    }
    ...
  ]
}
```

