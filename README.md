# bulksender-backend

## ディレクトリ構成

### src/common

パスの設定やステータスコードの設定が諸々書いてある。さわっていない

### src/model

型の定義が書いてある。

### src/service

api の処理の部分を書く

### src/routes

エンドポイントの設定を書いてある。今回は一つしかない。

### src/util

csv の保存処理を書いている。

### public

現状は csv が保存してある。

## 使用方法

まず、`npm install`を実行して依存関係をインストールしてください。

その後、`npm run dev`を実行してサーバーを起動してください。

## API

現在は`http://localhost:3000/api/signature`に POST リクエストを送ることで、csv の post リクエストを送ることが出来ます

### POST /api/signature

#### Request

```json
    {
    "signature": "539uCFvqfCLK8mmoxphzpjiwaP3yQmX1yxot7rD3cvwAXWpZN78Zhc39m9GBrKmU8Hhe5Xtz8CVxpkS8NcKDmR3F",
    "senderWallet": "3bJP1Thy43hxFhAMZfPKeu3CCanDWuD8EJkC6Q2yUj",
    "status" :"success",
    "error" : null,
    "errorMessage" : "errorMessage",
    "tokenType": "tokenType",
    "tokenSymbol" : "symbol",
    "tokenMintAddress": "So11111111111111111111111111111111111111111",
    "timeStamp": "20141010T045040Z",  // この形式でお願いします
    "uuid": "strng",
    "transactions": [
        {
        "recipientWallet": "5VTTMMPbgi4SjbKyeXwUvTf7S5VBYCRcqq4eHzV5BmyR",
        "amount": 2.999999
        },
        {
        "recipientWallet": "8KEXsoZYVRgmmXg9qfFnC7dMKjJdZRcfP3ATztR4KR5P",
        "amount": 2.654321
        },
        {

        "recipientWallet": "8KEXsoZYVRgmmXg9qfFnC7dMKjJdZRcfP3ATztR4KR5P",
        "amount": 2.654321
        }
     ...
    ]
    }
```
