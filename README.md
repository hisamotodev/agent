# Discord Report Bot

レポート管理機能を持つ Discord bot。

## セットアップ

1. 依存関係をインストール
   ```
   npm install
   ```
2. `.env.example` を `.env` にコピーし、値を設定
   ```
   DISCORD_TOKEN=（Bot のトークン）
   CLIENT_ID=（アプリケーションの Client ID）
   GUILD_ID=（開発用サーバーの ID。未設定ならグローバル登録）
   ```
3. スラッシュコマンドを登録
   ```
   npm run deploy
   ```
4. Bot を起動
   ```
   npm start
   ```

Bot に必要な権限: `applications.commands`, `bot`（メッセージの閲覧・送信・スレッド作成・スレッド内メッセージ管理）。
Discord Developer Portal で特別な Privileged Gateway Intents を有効にする必要はありません。

## 機能

### レポート管理

- `/agent report make [レポート名]`
  実行したチャンネルにレポート用の Embed を送信し、そのメッセージからスレッドを作成します。
  Embed には ステータス／作成者／回答者 が表示されます（作成直後は未解決・回答者なし）。

- スレッド内でメッセージが送信されると、送信者の回答で解決したかを確認する Embed とボタンが送信されます。
- ボタンが押されると、解決済みとしてマークした旨の Embed が送信され、レポート Embed のステータスと回答者が更新されます。
